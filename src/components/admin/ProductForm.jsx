import { Field } from '../FormFields';
import { categories } from '../../data/catalog';

// Formulario para crear o editar un producto.
// Props:
// - product: los datos que se muestran en el formulario
// - errors: mensajes de error por campo
// - isNew: true si es un producto nuevo (permite escribir el SKU)
// - onFieldChange(key, value): avisa al padre que cambió un campo
// - onSubmit / onCancel: botones Guardar y Cancelar
export default function ProductForm({ product, errors, isNew, onFieldChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Bootstrap: 1 columna en celular, 2 desde tablet (col-md-6) */}
      <div className="row gx-4">
        <Field
          col="col-md-6"
          label="Código SKU *"
          name="id"
          disabled={!isNew}
          value={product.id}
          onChange={e => onFieldChange('id', e.target.value)}
          error={errors.id}
        />
        <Field
          col="col-md-6"
          label="Nombre *"
          name="name"
          value={product.name}
          onChange={e => onFieldChange('name', e.target.value)}
          error={errors.name}
        />
        <Field
          col="col-md-6"
          label="Marca"
          name="brand"
          value={product.brand}
          onChange={e => onFieldChange('brand', e.target.value)}
        />
        <Field
          col="col-md-6"
          label="Categoría *"
          name="category"
          as="select"
          value={product.category}
          onChange={e => onFieldChange('category', e.target.value)}
          error={errors.category}
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Field>
        <Field
          col="col-md-6"
          label="Precio CLP *"
          name="price"
          type="number"
          min="0"
          value={product.price}
          onChange={e => onFieldChange('price', e.target.value)}
          error={errors.price}
        />
        <Field
          col="col-md-6"
          label="Stock *"
          name="stock"
          type="number"
          min="0"
          value={product.stock}
          onChange={e => onFieldChange('stock', e.target.value)}
          error={errors.stock}
        />
        <Field
          col="col-md-6"
          label="Descuento %"
          name="discount"
          type="number"
          min="0"
          max="100"
          value={product.discount}
          onChange={e => onFieldChange('discount', e.target.value)}
          error={errors.discount}
        />
        <Field
          col="col-md-6"
          label="Formato"
          name="format"
          value={product.format}
          onChange={e => onFieldChange('format', e.target.value)}
        />
        <div className="col-12">
          <Field
            name="description"
            label="Descripción"
            as="textarea"
            rows="3"
            value={product.description}
            onChange={e => onFieldChange('description', e.target.value)}
          />
          <Field
            name="image"
            label="Ruta de imagen / URL"
            value={product.image}
            onChange={e => onFieldChange('image', e.target.value)}
          />
        </div>
      </div>

      <label className="form-check mt-2">
        <input
          type="checkbox"
          className="form-check-input"
          checked={product.featured || false}
          onChange={e => onFieldChange('featured', e.target.checked)}
        />{' '}
        Producto destacado
      </label>

      <div className="form-buttons">
        <button type="submit" className="btn-orange">
          Guardar producto
        </button>
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
