import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  // Verify ownership
  const existingList = await prisma.shoppingList.findUnique({
    where: { id },
  });

  if (!existingList || existingList.userId !== userId) {
    return res.status(404).json({ message: "List not found" });
  }

  if (req.method === "GET") {
    try {
      const list = await prisma.shoppingList.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
            },
            orderBy: {
              checked: 'asc' // Unchecked items first
            }
          }
        }
      });
      res.status(200).json(list);
    } catch (error) {
      res.status(500).json({ message: "Error fetching list" });
    }
  } else if (req.method === "PUT") {
    const { name, items } = req.body;
    // items can be an array of operations or full replacement. 
    // For simplicity, let's handle name update and item toggle/add/remove separately in frontend or here.
    // Here we'll support updating name and syncing items if provided.
    
    try {
      const data = {};
      if (name) data.name = name;

      // If items are provided, we might need complex logic. 
      // For now, let's assume this endpoint is mostly for metadata updates or single item toggles via a specific structure?
      // Actually, for a simple app, let's just update the list details. 
      // Item management (add/remove) might be better handled via specific actions or a full sync.
      
      // Let's support full sync for simplicity in MVP: delete all and recreate if 'items' is passed
      // BUT that's dangerous. Let's stick to name update here, and maybe specific item endpoints or handle "toggle" via a separate route?
      // No, let's handle "toggle" here by accepting an `updateItem` object?
      // Let's keep it simple: PUT updates the list metadata.
      // We will create a separate logic for items if needed, OR handle everything here.
      
      // Let's handle "check item" via a specific body payload: { action: 'toggle', itemId: '...' }
      if (req.body.action === 'toggle' && req.body.itemId) {
        const item = await prisma.shoppingListItem.findUnique({ where: { id: req.body.itemId } });
        if (item) {
          await prisma.shoppingListItem.update({
            where: { id: req.body.itemId },
            data: { checked: !item.checked }
          });
        }
        return res.status(200).json({ success: true });
      }

      if (req.body.action === 'deleteItem' && req.body.itemId) {
        await prisma.shoppingListItem.delete({
          where: { id: req.body.itemId }
        });
        return res.status(200).json({ success: true });
      }
      
      if (req.body.action === 'addItem' && req.body.productId) {
         await prisma.shoppingListItem.create({
            data: {
                shoppingListId: id,
                productId: req.body.productId,
                quantity: req.body.quantity || 1
            }
         });
         return res.status(200).json({ success: true });
      }

      const updatedList = await prisma.shoppingList.update({
        where: { id },
        data: { name: name || existingList.name },
      });
      res.status(200).json(updatedList);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating list" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.shoppingList.delete({
        where: { id },
      });
      res.status(200).json({ message: "List deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting list" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
