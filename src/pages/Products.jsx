
import { useEffect, useState } from "react";

import ProductList from "../components/ProductList";

import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isFiltered, setIsFiltered] = useState(false);

  const limit = 12;

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function loadProducts(pageNumber = 1) {
    try {
      setLoading(true);

      const skip = (pageNumber - 1) * limit;
      const data = await getProducts(limit, skip);

      setProducts(data.products || []);
      setTotal(data.total || 0);
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function nextPage() {
    const totalPages = Math.ceil(total / limit);

    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      loadProducts(newPage);
    }
  }

  function previousPage() {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      loadProducts(newPage);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id);

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );

    } catch (error) {
      setError(error.message);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);

    setForm({
      title: product.title,
      price: product.price,
      description: product.description,
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  async function handleCreate(event) {
    event.preventDefault();

    try {
      const newProduct = await createProduct({
        ...form,
        price: Number(form.price),
      });

      setProducts((prev) => [newProduct, ...prev]);

      setForm({
        title: "",
        description: "",
        price: "",
      });

    } catch (error) {
      setError(error.message);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();

    try {
      const updatedProduct = await updateProduct(editingId, {
        ...form,
        price: Number(form.price),
      });

      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingId
            ? { ...product, ...updatedProduct }
            : product
        )
      );

      setEditingId(null);

      setForm({
        title: "",
        description: "",
        price: "",
      });

    } catch (error) {
      setError(error.message);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setPage(1);

      if (!search.trim()) {
        setCategory("");
        setIsFiltered(false);
        await loadProducts(1);
        return;
      }

      setCategory("");
      setIsFiltered(true);

      const data = await searchProducts(search);

      setProducts(data.products || []);
      setTotal(data.total || 0);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCategory(event) {
    const selectedCategory = event.target.value;

    setCategory(selectedCategory);
    setSearch("");
    setPage(1);

    try {
      setLoading(true);
      setError("");

      if (!selectedCategory) {
        setIsFiltered(false);
        await loadProducts(1);
        return;
      }

      setIsFiltered(true);

      const data = await getProductsByCategory(selectedCategory);

      setProducts(data.products || []);
      setTotal(data.total || 0);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p className="error">Error: {error}</p>;
  }

  return (
    <section className="products">

      <h1>Lista de productos</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">
          Buscar
        </button>
      </form>

      <select
        value={category}
        onChange={handleCategory}
      >
        <option value="">Todas las categorías</option>

        {categories.map((item) => {
          const value = item.slug || item;
          const label = item.name || item;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>

      <h2>
        {editingId ? "Editar producto" : "Crear producto"}
      </h2>

      <form
        onSubmit={editingId ? handleUpdate : handleCreate}
        className="create-form"
      >

        <input
          type="text"
          name="title"
          placeholder="Nombre del producto"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
        />

        <button type="submit">
          {editingId ? "Actualizar" : "Guardar"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                title: "",
                description: "",
                price: "",
              });
            }}
          >
            Cancelar
          </button>
        )}

      </form>

      <ProductList
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {!isFiltered && (
        <div className="pagination">

          <button
            onClick={previousPage}
            disabled={page === 1}
          >
            Anterior
          </button>

          <span>
            Página {page} de {Math.ceil(total / limit)}
          </span>

          <button
            onClick={nextPage}
            disabled={page >= Math.ceil(total / limit)}
          >
            Siguiente
          </button>

        </div>
      )}

    </section>
  );
}

export default Products;
