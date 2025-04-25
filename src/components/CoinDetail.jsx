import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function CoinDetail() {
  const { coinId } = useParams()
  const [coin, setCoin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCoinDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`)
        
        if (!response.ok) {
          throw new Error('Error al obtener detalles de la moneda')
        }
        
        const data = await response.json()
        setCoin(data)
        setLoading(false)
      } catch (error) {
        setError(error.message)
        setLoading(false)
      }
    }
    
    fetchCoinDetails()
  }, [coinId])
  
  if (loading) return <div className="loading">Cargando detalles...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!coin) return <div className="error">No se encontraron datos para esta moneda</div>
  
  return (
    <div className="coin-detail">
      <Link to="/" className="back-button">← Volver</Link>
      
      <div className="coin-detail-header">
        <img src={coin.image.large} alt={coin.name} className="coin-detail-image" />
        <h2 className="coin-detail-title">
          {coin.name} 
          <span className="coin-detail-symbol">({coin.symbol.toUpperCase()})</span>
        </h2>
        <div className="rank">#{coin.market_cap_rank}</div>
      </div>
      
      <div className="coin-stats">
        <div className="stat-card">
          <div className="stat-title">Precio actual</div>
          <div className="stat-value">${coin.market_data.current_price.usd.toLocaleString()}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Cambio de precio (24h)</div>
          <div className={`stat-value ${coin.market_data.price_change_percentage_24h > 0 ? "positive" : "negative"}`}>
            {coin.market_data.price_change_percentage_24h.toFixed(2)}%
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Capitalización de mercado</div>
          <div className="stat-value">${coin.market_data.market_cap.usd.toLocaleString()}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Volumen (24h)</div>
          <div className="stat-value">${coin.market_data.total_volume.usd.toLocaleString()}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Máximo histórico</div>
          <div className="stat-value">
            ${coin.market_data.ath.usd.toLocaleString()}
            <span className={`${coin.market_data.ath_change_percentage.usd > 0 ? "positive" : "negative"}`} style={{ fontSize: '14px', marginLeft: '10px' }}>
              ({coin.market_data.ath_change_percentage.usd.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Mínimo histórico</div>
          <div className="stat-value">
            ${coin.market_data.atl.usd.toLocaleString()}
            <span className={`${coin.market_data.atl_change_percentage.usd > 0 ? "positive" : "negative"}`} style={{ fontSize: '14px', marginLeft: '10px' }}>
              ({coin.market_data.atl_change_percentage.usd.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
      
      <div className="description">
        <h3>Sobre {coin.name}</h3>
        <div dangerouslySetInnerHTML={{ __html: coin.description.es || coin.description.en }} />
      </div>
    </div>
  )
}

export default CoinDetail 