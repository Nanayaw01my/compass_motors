import { AdminHeader } from "@/components/admin/AdminHeader";
import { NewCustomerForm } from "@/components/admin/NewCustomerForm";

export default function NewCustomerPage() {
  return (
    <>
      <AdminHeader title="Register Customer" subtitle="Fill in all customer details to create an account" />
      <div className="p-6">
        <NewCustomerForm />
      </div>
    </>
  );
}
