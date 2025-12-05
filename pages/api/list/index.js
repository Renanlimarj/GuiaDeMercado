import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    try {
      let list = await prisma.shoppingList.findFirst({
        where: { userId },
        include: {
          items: {
            include: { product: true },
            orderBy: { product: { name: "asc" } },
          },
        },
      });

      if (!list) {
        list = await prisma.shoppingList.create({
          data: { userId },
          include: { items: true },
        });
      }

      res.status(200).json(list);
    } catch (error) {
      res.status(500).json({ message: "Error fetching list" });
    }
  } else if (req.method === "POST") {
    const { productId, quantity } = req.body;

    try {
      let list = await prisma.shoppingList.findFirst({ where: { userId } });
      if (!list) {
        list = await prisma.shoppingList.create({ data: { userId } });
      }

      const item = await prisma.shoppingListItem.create({
        data: {
          shoppingListId: list.id,
          productId,
          quantity: quantity || 1,
        },
      });
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Error adding item" });
    }
  } else if (req.method === "PUT") {
    const { itemId, checked } = req.body;
    try {
      const item = await prisma.shoppingListItem.update({
        where: { id: itemId },
        data: { checked },
      });
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: "Error updating item" });
    }
  } else if (req.method === "DELETE") {
    const { itemId } = req.query;
    try {
      await prisma.shoppingListItem.delete({
        where: { id: itemId },
      });
      res.status(200).json({ message: "Item deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting item" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
