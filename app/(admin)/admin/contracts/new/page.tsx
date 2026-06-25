import { AdminHeader } from "@/components/admin/AdminHeader";
import { NewContractForm } from "@/components/admin/NewContractForm";
import { connectDB } from "@/lib/db/connect";
import Customer from "@/lib/db/models/Customer";
import Motorcycle from "@/lib/db/models/Motorcycle";

async function getData() {
  await connectDB();
  const [customers, motorcycles] = await Promise.all([
    Customer.find({ status: "active" }).select("fullName customerId phone").sort({ fullName: 1 }),
    Motorcycle.find({ status: "available" }).sort({ brand: 1 }),
  ]);
  return {
    customers: JSON.parse(JSON.stringify(customers)),
    motorcycles: JSON.parse(JSON.stringify(motorcycles)),
  };
}

export default async function NewContractPage() {
  const { customers, motorcycles } = await getData();

  return (
    <>
      <AdminHeader title="New Contract" subtitle="Create an installment or work-and-pay agreement" />
      <div className="p-6">
        <NewContractForm customers={customers} motorcycles={motorcycles} />
      </div>
    </>
  );
}
