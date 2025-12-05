import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    try {
      // Fetch last 5 lists
      const lastLists = await prisma.shoppingList.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Extract unique products
      const productMap = new Map();
      
      lastLists.forEach(list => {
        list.items.forEach(item => {
          if (item.product && !productMap.has(item.productId)) {
            productMap.set(item.productId, item.product);
          }
        });
      });

      const recentProducts = Array.from(productMap.values());

      res.status(200).json(recentProducts);
    } catch (error) {
      console.error("Error fetching recent products:", error);
      res.status(500).json({ message: "Error fetching recent products" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
