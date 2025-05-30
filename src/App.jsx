import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import { supabase } from './lib/supabase'
import './App.css'

// Componentes
import CoinDetail from './components/CoinDetail'
import Favorites from './components/Favorites'
import Auth from './components/Auth'

function App() {
  const [session, setSession] = useState(null)
  const [coins, setCoins] = useState([])
  const [filteredCoins, setFilteredCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap_rank', direction: 'ascending' })
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('cryptoFavorites')
    return savedFavorites ? JSON.parse(savedFavorites) : []
  })
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const location = useLocation()
  
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1')
        
        if (!response.ok) {
          throw new Error('Error al obtener datos de CoinGecko')
        }
        
        const data = await response.json()
        setCoins(data)
        setFilteredCoins(data)
        setLoading(false)
      } catch (error) {
        setError(error.message)
        setLoading(false)
      }
    }
    
    fetchCoins()
  }, [])
  
  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    // Filtrar monedas basado en el término de búsqueda
    const results = coins.filter(coin => 
      coin.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      coin.symbol.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    
    // Ordenar monedas según la configuración actual
    const sortedResults = [...results].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1
      }
      return 0
    })
    
    setFilteredCoins(sortedResults)
  }, [debouncedSearch, coins, sortConfig])
  
  useEffect(() => {
    localStorage.setItem('cryptoFavorites', JSON.stringify(favorites))
  }, [favorites])
  
  useEffect(() => {
    // Comprobar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])
  
  const handleSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }
  
  const toggleFavorite = (coinId) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(coinId)) {
        return prevFavorites.filter(id => id !== coinId)
      } else {
        return [...prevFavorites, coinId]
      }
    })
  }
  
  const getFavoriteCoins = () => {
    return coins.filter(coin => favorites.includes(coin.id))
  }
  
  const Home = () => {
    if (loading) return <div className="loading">Cargando datos...</div>
    if (error) return <div className="error">Error: {error}</div>
    
    return (
      <>
        <div className="search-sort-container">
          <div className="search-container">              <input 
              type="text" 
              placeholder="Buscar criptomoneda..." 
              className="search-input"
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 20) { // Limitar longitud de búsqueda
                  setSearch(value);
                }
              }}
            />
          </div>
          
          <div className="sort-buttons">
            <button onClick={() => handleSort('current_price')} className="sort-button">
              Ordenar por precio {sortConfig.key === 'current_price' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </button>
            <button onClick={() => handleSort('market_cap_rank')} className="sort-button">
              Ordenar por ranking {sortConfig.key === 'market_cap_rank' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </button>
            <button onClick={() => handleSort('price_change_percentage_24h')} className="sort-button">
              Ordenar por cambio 24h {sortConfig.key === 'price_change_percentage_24h' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </button>
          </div>
        </div>
        
        <div className="coin-container">
          {filteredCoins.length > 0 ? (
            filteredCoins.map(coin => (
              <div key={coin.id} className="coin-card">
                <div className="favorite-icon" onClick={(e) => {
                  e.stopPropagation(); 
                  toggleFavorite(coin.id);
                }}>
                  <FontAwesomeIcon 
                    icon={favorites.includes(coin.id) ? faStarSolid : faStarRegular} 
                    className={favorites.includes(coin.id) ? "star-active" : "star-inactive"} 
                  />
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
            ))
          ) : (
            <div className="no-results">No se encontraron resultados para "{search}"</div>
          )}
        </div>
      </>
    )
  }
  
  return (
    <div className="app-container">
      {!session ? (
        <Auth />
      ) : (
        <>
          <nav className="floating-menu">
            <div className="logo">CriptoTracker</div>
            <div className="nav-links">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Inicio</Link>
              <Link to="/favorites" className={location.pathname === '/favorites' ? 'active' : ''}>Favoritos</Link>          
              <Link to="/coin/bitcoin" className={location.pathname === '/coin/bitcoin' ? 'active' : ''}>Bitcoin</Link>
              <Link to="/coin/tether" className={location.pathname === '/coin/tether' ? 'active' : ''}>Tether</Link>
              <Link to="/coin/ethereum" className={location.pathname === '/coin/ethereum' ? 'active' : ''}>Ethereum</Link>
              <Link to="/coin/solana" className={location.pathname === '/coin/solana' ? 'active' : ''}>Solana</Link>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="logout-button"
              >
                Cerrar Sesión
              </button>
            </div>
          </nav>
          
          <div className="container">
            <h1>Mercado de Criptomonedas</h1>
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/favorites" element={<Favorites favorites={getFavoriteCoins()} toggleFavorite={toggleFavorite} />} />
              <Route path="/coin/:coinId" element={<CoinDetail />} />
            </Routes>
            
           
          </div>
        </>
      )}
    </div>
  )
}

export default App
