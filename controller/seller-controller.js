const Product =require('../models/Product');
const Order =require('../models/Order');


// /**
//  * @route   GET /api/seller/stats
//  * @desc    Get comprehensive seller dashboard statistics
//  * @access  Private (Seller only)
//  */

exports.getSellerDashboardStats = async (req, res) => {
    try {
        const sellerId = req.user.id;
        
        // Get all products by this seller
        const products = await Product.find({ seller: sellerId });
        
        // Get product IDs for filtering orders
        const productIds = products.map(product => product._id);
        
        // Find all orders containing products from this seller
        const allOrders = await Order.find({
          'orderItems.product': { $in: productIds }
        }).sort({ createdAt: -1 });
    
        // Calculate revenue statistics
        let totalRevenue = 0;
        const monthlySales = Array(12).fill(0);
        const currentMonth = new Date().getMonth();
        const previousMonth = (currentMonth - 1 + 12) % 12;
        let currentMonthRevenue = 0;
        let previousMonthRevenue = 0;
        
        // Process orders
        const processedOrders = [];
        
        allOrders.forEach(order => {
          // Filter to only include seller's products in each order
          const sellerOrderItems = order.orderItems.filter(item => 
            productIds.some(id => id.toString() === item.product.toString())
          );
          
          if (sellerOrderItems.length > 0) {
            // Calculate seller's revenue from this order
            const orderRevenue = sellerOrderItems.reduce((sum, item) => 
              sum + (item.price * item.quantity), 0
            );
            
            if (order.isPaid) {
              totalRevenue += orderRevenue;
              
              // Add to monthly revenue
              const orderDate = new Date(order.createdAt);
              const orderMonth = orderDate.getMonth();
              monthlySales[orderMonth] += orderRevenue;
              
              // Calculate current and previous month revenues
              if (orderMonth === currentMonth) {
                currentMonthRevenue += orderRevenue;
              } else if (orderMonth === previousMonth) {
                previousMonthRevenue += orderRevenue;
              }
            }
            
            // Add to processed orders for recent orders list
            processedOrders.push({
              _id: order._id,
              createdAt: order.createdAt,
              totalAmount: orderRevenue,
              isPaid: order.isPaid,
              isDelivered: order.isDelivered,
              itemCount: sellerOrderItems.length
            });
          }
        });
        
        // Calculate revenue change percentage
        const revenueChangePercent = previousMonthRevenue === 0 
          ? 0 
          : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
        
        // Get recent orders for display (last 5)
        const recentOrders = processedOrders.slice(0, 5);
        
        // Calculate order stats
        const totalOrders = processedOrders.length;
        
        // Recent orders (last 24 hours)
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentOrdersCount = processedOrders.filter(order => 
          new Date(order.createdAt) > last24Hours
        ).length;
        
        // Product statistics
        const totalProducts = products.length;
        
        // New products (added in last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newProductsCount = products.filter(product => 
          new Date(product.createdAt) > thirtyDaysAgo
        ).length;
        
        // Calculate active users (unique users who placed orders in the last 24 hours)
        // Note: This requires Orders to store user information
        const activeUsers = new Set(
          allOrders
            .filter(order => new Date(order.createdAt) > last24Hours)
            .map(order => order.user?.toString())
        ).size;
        
        // Calculate top selling products
        const productSales = {};
        allOrders.forEach(order => {
          order.orderItems.forEach(item => {
            if (!productIds.some(id => id.toString() === item.product.toString())) {
              return; // Skip if not seller's product
            }
            
            const productId = item.product.toString();
            if (!productSales[productId]) {
              productSales[productId] = {
                totalQuantity: 0,
                totalRevenue: 0
              };
            }
            
            productSales[productId].totalQuantity += item.quantity;
            productSales[productId].totalRevenue += item.price * item.quantity;
          });
        });
        
        // Get product details and sort by sales
        const topSellingProducts = await Promise.all(
          Object.keys(productSales)
            .map(async (productId) => {
              const product = await Product.findById(productId, 'name image price');
              return {
                _id: productId,
                name: product.name,
                image: product.image,
                price: product.price,
                totalSold: productSales[productId].totalQuantity,
                totalRevenue: productSales[productId].totalRevenue
              };
            })
        );
        
        // Sort by quantity sold and get top 5
        topSellingProducts.sort((a, b) => b.totalSold - a.totalSold);
        const top5Products = topSellingProducts.slice(0, 5);
        
        // Format monthly data for charts
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = monthNames.map((month, index) => ({
          name: month,
          revenue: monthlySales[index].toFixed(2)
        }));
        
        // Return all stats in single response
        return res.status(200).json({
          success: true,
          data: {
            // Revenue stats
            totalRevenue: totalRevenue.toFixed(2),
            revenueChange: revenueChangePercent.toFixed(1),
            monthlyRevenue: monthlyData,
            
            // Order stats
            totalOrders,
            recentOrdersCount,
            recentOrders,
            
            // Product stats
            totalProducts,
            newProductsCount,
            topSellingProducts: top5Products,
            
            // User stats
            activeUsers
          }
        });
        
      } catch (err) {
        console.error('Error generating seller stats:', err);
        return res.status(500).json({
          success: false,
          error: 'Server error'
        });
      }
}
