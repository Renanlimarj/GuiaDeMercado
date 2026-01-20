import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          priceEntries: {
            orderBy: { date: 'asc' },
            include: { supermarket: true }
          }
        }
      });

      if (!product) return res.status(404).json({ message: "Product not found" });

      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching product" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
