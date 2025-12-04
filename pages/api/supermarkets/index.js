import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { name, address, latitude, longitude } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    try {
      const supermarket = await prisma.supermarket.create({
        data: {
          name,
          address,
          latitude,
          longitude,
        },
      });
      res.status(201).json(supermarket);
    } catch (error) {
      res.status(500).json({ message: "Error creating supermarket" });
    }
  } else if (req.method === "GET") {
    try {
      const supermarkets = await prisma.supermarket.findMany({
        orderBy: { name: "asc" },
      });
      res.status(200).json(supermarkets);
    } catch (error) {
      res.status(500).json({ message: "Error fetching supermarkets" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
