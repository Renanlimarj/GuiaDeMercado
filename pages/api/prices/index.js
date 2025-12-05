import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === "POST") {
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { supermarketId, productId, price } = req.body;

    if (!supermarketId || !productId || !price) {
      return res.status(400).json({ message: "Missing fields" });
    }

    try {
      const priceEntry = await prisma.priceEntry.create({
        data: {
          price: parseFloat(price),
          supermarketId,
          productId,
          userId: session.user.id,
        },
      });
      res.status(201).json(priceEntry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating price entry" });
    }
  } else if (req.method === "GET") {
    try {
      const prices = await prisma.priceEntry.findMany({
        include: {
          supermarket: true,
          product: true,
          user: {
            select: { name: true },
          },
        },
        orderBy: { date: "desc" },
        take: 20,
      });
      res.status(200).json(prices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching prices" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
