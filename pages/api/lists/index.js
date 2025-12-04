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
      const lists = await prisma.shoppingList.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { items: true }
          }
        }
      });
      res.status(200).json(lists);
    } catch (error) {
      console.error("Error fetching lists:", error);
      res.status(500).json({ message: "Error fetching lists" });
    }
  } else if (req.method === "POST") {
    const { name, items } = req.body; // items is array of { productId, quantity }

    try {
      const list = await prisma.shoppingList.create({
        data: {
          name: name || "Minha Lista",
          userId,
          items: {
            create: items?.map(item => ({
              productId: item.productId,
              quantity: item.quantity || 1
            })) || []
          }
        },
        include: { items: true }
      });
      res.status(201).json(list);
    } catch (error) {
      console.error("Error creating list:", error);
      res.status(500).json({ message: "Error creating list" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
