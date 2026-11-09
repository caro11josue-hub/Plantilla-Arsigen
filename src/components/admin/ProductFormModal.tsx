import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, MenuCategory } from '../../domain/models';
import { GlassCard } from '../common/GlassCard';
import { compressImageToWebP } from '../../utils/imageCompression';
import { X, Upload, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  item: MenuItem | null; // null si es nuevo plato
  categories: MenuCategory[];
  onClose: () => void;
  onSave: (item: MenuItem) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  item,
  categories,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategoryId(item.categoryId);
      setDescription(item.description);
      setPrice(item.price);
      setImageUrl(item.imageUrl);
      setIsAvailable(item.isAvailable);
      setCompressionInfo(null);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setPrice(25000);
      setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
      setIsAvailable(true);
      setCompressionInfo(null);
    }
  }, [item, categories, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const { file: compressed, dataUrl } = await compressImageToWebP(file);
      setImageUrl(dataUrl);
      const originalKb = Math.round(file.size / 1024);
      const compressedKb = Math.round(compressed.size / 1024);
      setCompressionInfo(`Comprimido: ${originalKb} KB → ${compressedKb} KB (WebP optimizado)`);
    } catch (err) {
      console.error('Error al comprimir foto:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    setIsSaving(true);
    try {
      const savedItem: MenuItem = {
        id: item?.id || `item_${Date.now()}`,
        name: name.trim(),
        categoryId,
        description: description.trim(),
        price: Number(price) || 0,
        imageUrl,
        isAvailable,
        sortOrder: item?.sortOrder || 99,
        createdAt: item?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await onSave(savedItem);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl my-8"
        >
          <GlassCard glow className="border-blue-500/30 p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                {item ? 'Editar Plato del Menú' : 'Nuevo Plato en el Menú'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre del plato */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre del Plato *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Hamburguesa Artesanal Trufada"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Categoría y Precio neto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Categoría *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Precio Neto (COP, IVA incl.) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={500}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descripción e Ingredientes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe la preparación, guarniciones y sabores clave..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Foto con Compresión WebP */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Foto Gastronómica (Compresión WebP automática)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>{isCompressing ? 'Comprimiendo a WebP...' : 'Subir Imagen'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isCompressing}
                        className="hidden"
                      />
                    </label>
                    {compressionInfo && (
                      <div className="mt-1.5 text-[11px] text-emerald-400 font-medium">
                        ✓ {compressionInfo}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Disponibilidad (Stock) */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Disponibilidad en Carta
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Si se desmarca, se mostrará como "Agotado" inmediatamente a los clientes.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    isAvailable ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isAvailable ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isCompressing}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Plato'}
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
