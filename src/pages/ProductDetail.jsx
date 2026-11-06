
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../services/productService";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error al cargar el producto.", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) return <p>Cargando producto...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Producto no encontrado.</p>;

  return (
    <section>
      <Link to="/products">← Regresar</Link>

      <h1>{product.title}</h1>

      <img
        src={product.thumbnail}
        alt={product.title}
        width="250"
      />

      <p>{product.description}</p>
      <p>Categoría: {product.category}</p>
      <p>Precio: ${product.price}</p>
      <p>Stock: {product.stock}</p>
      <p>Calificación: {product.rating}</p>
    </section>
  );
}

export default ProductDetail;
