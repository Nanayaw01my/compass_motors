import React from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { connectDB } from "@/lib/db/connect";
import Motorcycle from "@/lib/db/models/Motorcycle";
import { formatCurrency } from "@/lib/utils";
import { Plus, Bike } from "lucide-react";

async function getMotorcycles() {
  await connectDB();
  const motorcycles = await Motorcycle.find().sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(motorcycles));
}

const statusVariant = (status: string): "success" | "warning" | "default" | "secondary" => {
  if (status === "available") return "success";
  if (status === "reserved") return "warning";
  if (status === "sold") return "secondary";
  return "default";
};

export default async function MotorcyclesPage() {
  const motorcycles = await getMotorcycles();

  return (
    <>
      <AdminHeader title="Motorcycles" subtitle={`${motorcycles.length} motorcycles in inventory`} />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Link href="/admin/motorcycles/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Motorcycle
            </Button>
          </Link>
        </div>

        {motorcycles.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bike className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No motorcycles yet</p>
              <Link href="/admin/motorcycles/new" className="mt-4 inline-block">
                <Button size="sm">Add Motorcycle</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {motorcycles.map((m: any) => (
              <Card key={m._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  {m.images?.[0] ? (
                    <img src={m.images[0]} alt={m.model} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bike className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{m.brand} {m.model}</h3>
                      <p className="text-sm text-gray-500">{m.year}</p>
                    </div>
                    <Badge variant={statusVariant(m.status)}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><span className="text-gray-400">Price: </span><span className="font-semibold text-red-600">{formatCurrency(m.sellingPrice)}</span></div>
                    <div><span className="text-gray-400">Install: </span><span className="font-semibold">{formatCurrency(m.installmentPrice)}</span></div>
                    <div><span className="text-gray-400">Qty: </span><span className="font-semibold">{m.quantity}</span></div>
                  </div>
                  <Link href={`/admin/motorcycles/${m._id}`}>
                    <Button size="sm" variant="outline" className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
