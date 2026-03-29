"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { MenuCategory, MenuItem } from "@/types";
import {
  fetchMenuCategories,
  fetchMenuItems,
  createMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CardSkeleton } from "@/components/LoadingSkeleton";

export default function CrmCardapioPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Item dialog state
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    available: true,
  });

  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const load = async () => {
    try {
      const [cats, menuItems] = await Promise.all([fetchMenuCategories(), fetchMenuItems()]);
      setCategories(cats);
      setItems(menuItems);
      if (cats.length > 0 && activeTab === "all") {
        setActiveTab("all");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar cardapio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems =
    activeTab === "all" ? items : items.filter((item) => item.categoryId === activeTab);

  const handleOpenNewItem = () => {
    setEditingItem(null);
    setItemForm({
      categoryId: activeTab !== "all" ? activeTab : categories[0]?.id || "",
      name: "",
      description: "",
      price: "",
      available: true,
    });
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: String(item.price),
      available: item.available,
    });
    setItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      if (!itemForm.name || !itemForm.price || !itemForm.categoryId) {
        toast.error("Preencha todos os campos obrigatorios");
        return;
      }

      if (editingItem) {
        await updateMenuItem({
          id: Number(editingItem.id),
          categoryId: Number(itemForm.categoryId),
          name: itemForm.name,
          description: itemForm.description,
          price: Number(itemForm.price),
          available: itemForm.available,
        });
      } else {
        await createMenuItem({
          categoryId: Number(itemForm.categoryId),
          name: itemForm.name,
          description: itemForm.description,
          price: Number(itemForm.price),
          available: itemForm.available,
        });
      }
      setItemDialogOpen(false);
      setEditingItem(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar prato");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este prato?")) {
      try {
        await deleteMenuItem(id);
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir");
      }
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await toggleMenuItemAvailability(id);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (!categoryForm.name) {
        toast.error("Nome da categoria e obrigatorio");
        return;
      }
      await createMenuCategory({
        name: categoryForm.name,
        description: categoryForm.description,
      });
      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", description: "" });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar categoria");
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Sem categoria";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-7 w-32 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cardapio</h1>
          <p className="text-muted-foreground">
            {items.length} pratos em {categories.length} categorias
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCategoryForm({ name: "", description: "" });
              setCategoryDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
          <Button onClick={handleOpenNewItem}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Prato
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v ?? "all")}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className={!item.available ? "opacity-60" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {getCategoryName(item.categoryId)}
                      </Badge>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleToggleAvailability(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
                        title={item.available ? "Marcar indisponivel" : "Marcar disponivel"}
                      >
                        {item.available ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-lg font-bold text-foreground">
                      R$ {item.price.toFixed(2).replace(".", ",")}
                    </span>
                    <Badge variant={item.available ? "default" : "secondary"}>
                      {item.available ? "Disponivel" : "Indisponivel"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum prato encontrado nesta categoria.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Prato" : "Novo Prato"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="item-name">Nome *</Label>
              <Input
                id="item-name"
                value={itemForm.name}
                onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome do prato"
              />
            </div>
            <div>
              <Label htmlFor="item-category">Categoria *</Label>
              <Select
                value={itemForm.categoryId}
                onValueChange={(val) => setItemForm((f) => ({ ...f, categoryId: val ?? "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="item-description">Descricao</Label>
              <Textarea
                id="item-description"
                value={itemForm.description}
                onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descricao do prato"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="item-price">Preco (R$) *</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={itemForm.price}
                onChange={(e) => setItemForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0,00"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="item-available"
                checked={itemForm.available}
                onChange={(e) => setItemForm((f) => ({ ...f, available: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="item-available">Disponivel</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveItem}>{editingItem ? "Salvar" : "Criar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="cat-name">Nome *</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nome da categoria"
              />
            </div>
            <div>
              <Label htmlFor="cat-description">Descricao</Label>
              <Textarea
                id="cat-description"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Descricao da categoria"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCategory}>Criar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
