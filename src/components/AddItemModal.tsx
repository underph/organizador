
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUpload from "./ImageUpload";
import { Item } from "@/types/Item";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<Item, "id" | "created_at" | "updated_at">) => void;
}

const AddItemModal = ({ isOpen, onClose, onAdd }: AddItemModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    quantity: 1,
    amount_saved: 0,
    image_url: "",
    purchase_links: [""]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty links before submitting
    const filteredData = {
      ...formData,
      purchase_links: formData.purchase_links.filter(link => link.trim() !== "")
    };
    onAdd(filteredData);
    setFormData({ name: "", description: "", price: 0, quantity: 1, amount_saved: 0, image_url: "", purchase_links: [""] });
    onClose();
  };

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Item</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Sofá novo"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o item..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              placeholder="1"
              required
            />
          </div>

          <ImageUpload onImageUploaded={handleImageUploaded} />

          <div>
            <Label>Links para Compras/Comparação (opcional)</Label>
            {formData.purchase_links.map((link, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...formData.purchase_links];
                    newLinks[index] = e.target.value;
                    setFormData(prev => ({ ...prev, purchase_links: newLinks }));
                  }}
                  placeholder="https://exemplo.com/produto"
                  className="flex-1"
                />
                {formData.purchase_links.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newLinks = formData.purchase_links.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, purchase_links: newLinks }));
                    }}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(prev => ({ 
                  ...prev, 
                  purchase_links: [...prev.purchase_links, ""] 
                }));
              }}
              className="mt-2"
            >
              + Adicionar Link
            </Button>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Adicionar Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
