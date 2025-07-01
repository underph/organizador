
import { useState } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Item } from "@/types/Item";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<Item, "id" | "createdAt">) => void;
}

const AddItemModal = ({ isOpen, onClose, onAdd }: AddItemModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    amountSaved: "",
    imageUrl: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.imageUrl) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const price = parseFloat(formData.price);
    const amountSaved = parseFloat(formData.amountSaved) || 0;

    if (price <= 0) {
      alert("O preço deve ser maior que zero.");
      return;
    }

    if (amountSaved < 0) {
      alert("O valor arrecadado não pode ser negativo.");
      return;
    }

    onAdd({
      name: formData.name,
      description: formData.description,
      price: price,
      amountSaved: amountSaved,
      imageUrl: formData.imageUrl
    });

    // Reset form
    setFormData({
      name: "",
      description: "",
      price: "",
      amountSaved: "",
      imageUrl: ""
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Adicionar Novo Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Item */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome do Item *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Máquina de Café Espresso"
              className="border-gray-300 focus:border-secondary"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Breve descrição do item..."
              className="border-gray-300 focus:border-secondary resize-none"
              rows={3}
            />
          </div>

          {/* URL da Imagem */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium">
              URL da Imagem *
            </Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="border-gray-300 focus:border-secondary"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview"
                  className="w-full h-32 object-cover rounded border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Preço Total */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">
              Preço Total (R$) *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="0,00"
              className="border-gray-300 focus:border-secondary"
            />
          </div>

          {/* Valor Arrecadado */}
          <div className="space-y-2">
            <Label htmlFor="amountSaved" className="text-sm font-medium">
              Valor Já Arrecadado (R$)
            </Label>
            <Input
              id="amountSaved"
              type="number"
              step="0.01"
              min="0"
              value={formData.amountSaved}
              onChange={(e) => handleChange("amountSaved", e.target.value)}
              placeholder="0,00"
              className="border-gray-300 focus:border-secondary"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-secondary hover:bg-secondary/90 text-white"
            >
              Adicionar Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
