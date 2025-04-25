import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons'

function Favorites({ favorites, toggleFavorite }) {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="no-favorites">
        <h2>No tienes monedas favoritas</h2>
        <p>Marca alguna moneda como favorita haciendo clic en la estrella.</p>
        <Link to="/" className="back-button" style={{ marginTop: '20px', display: 'inline-block' }}>
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="favorites-heading">Tus Monedas Favoritas ({favorites.length})</h2>
      
      <div className="coin-container">
        {favorites.map(coin => (
          <div key={coin.id} className="coin-card">
            <div className="favorite-icon" onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(coin.id)
            }}>
              <FontAwesomeIcon icon={faStarSolid} className="star-active" />
            </div>
            <Link to={`/coin/${coin.id}`} className="coin-link">
              <div className="coin-header">
                <img src={coin.image} alt={coin.name} className="coin-image" />
                <h2>{coin.name} <span className="symbol">({coin.symbol.toUpperCase()})</span></h2>
                <div className="rank">#{coin.market_cap_rank}</div>
              </div>
              <div className="coin-info">
                <p className="price">Precio: ${coin.current_price.toLocaleString()}</p>
                <p className={coin.price_change_percentage_24h > 0 ? "positive" : "negative"}>
                  Cambio 24h: {coin.price_change_percentage_24h.toFixed(2)}%
                </p>
                <p className="market-cap">Cap. de Mercado: ${coin.market_cap.toLocaleString()}</p>
                <p className="volume">Volumen 24h: ${coin.total_volume.toLocaleString()}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Favorites 