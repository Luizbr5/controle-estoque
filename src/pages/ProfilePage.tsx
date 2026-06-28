import { PageHeader } from "@/components/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui-kit/Card";
import { Input } from "@/components/ui-kit/Input";
import { Button } from "@/components/ui-kit/Button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Meu perfil"
        description="Visualize e atualize suas informações de conta."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.info("Endpoint de atualização ainda não disponível na API.");
              }}
            >
              <Input label="Nome" defaultValue={user?.name ?? ""} />
              <Input label="E-mail" type="email" defaultValue={user?.email ?? ""} />
              <Button type="submit" className="self-start">
                Salvar alterações
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar senha</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.info("Endpoint de alteração de senha ainda não disponível na API.");
              }}
            >
              <Input label="Senha atual" type="password" />
              <Input label="Nova senha" type="password" hint="Mínimo de 6 caracteres" />
              <Input label="Confirmar nova senha" type="password" />
              <Button type="submit" className="self-start">
                Atualizar senha
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
