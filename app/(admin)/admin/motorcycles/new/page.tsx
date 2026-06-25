import { AdminHeader } from "@/components/admin/AdminHeader";
import { NewMotorcycleForm } from "@/components/admin/NewMotorcycleForm";

export default function NewMotorcyclePage() {
  return (
    <>
      <AdminHeader title="Add Motorcycle" subtitle="Add a new motorcycle to inventory" />
      <div className="p-6">
        <NewMotorcycleForm />
      </div>
    </>
  );
}
