import { useState } from 'react'

const initialDestination = {
  date: '',
  address: '',
}

function formatDateForInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function sortDestinationsByDate(destinations) {
  return [...destinations].sort((first, second) => {
    if (!first.date) return 1
    if (!second.date) return -1
    return first.date.localeCompare(second.date)
  })
}

function App() {
  const today = new Date()
  const minimumDate = formatDateForInput(today)
  const maximumDateValue = new Date(today)
  maximumDateValue.setDate(today.getDate() + 16)
  const maximumDate = formatDateForInput(maximumDateValue)
  const [clothing, setClothing] = useState({
    calcas: 1,
    camisetas: 3,
    shorts: 2,
    agasalhos: 1,
  })
  const [destinations, setDestinations] = useState([{ ...initialDestination }])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function updateDestination(index, field, value) {
    setDestinations((current) => {
      const updatedDestinations = current.map((destination, destinationIndex) =>
        destinationIndex === index
          ? { ...destination, [field]: value }
          : destination,
      )

      return field === 'date'
        ? sortDestinationsByDate(updatedDestinations)
        : updatedDestinations
    })
  }

  function addDestination() {
    setDestinations((current) => [...current, { ...initialDestination }])
  }

  function removeDestination(index) {
    setDestinations((current) =>
      current.length === 1
        ? current
        : current.filter((_, destinationIndex) => destinationIndex !== index),
    )
  }

  async function submitTrip(event) {
    event.preventDefault()
    setErrorMessage('')

    const apiUrl = import.meta.env.VITE_API_URL
    const payload = {
      roupas: Object.fromEntries(
        Object.entries(clothing).map(([type, amount]) => [type, Number(amount)]),
      ),
      destinos: destinations.map((destination) => ({
        data: destination.date,
        localizacao: destination.address,
      })),
    }

    if (!apiUrl) {
      setStatus('error')
      setErrorMessage('Configure VITE_API_URL para salvar o roteiro na API.')
      return
    }

    setStatus('loading')
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/roteiros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Não foi possível salvar o roteiro.')
      }

      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message)
    }
  }

  function updateClothing(type, value) {
    setClothing((current) => ({ ...current, [type]: value }))
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span>Vesti<span>Tempo</span></span>
        </div>
        <div className="sidebar-copy">
          <p className="eyebrow">Seu estilo, em qualquer clima</p>
          <h1>Vista-se para viver a viagem.</h1>
          <p>
            Organize seu roteiro e receba combinações pensadas para cada
            destino e previsão.
          </p>
        </div>
        <div className="weather-orbit" aria-hidden="true">
          <span className="sun">☼</span>
          <span className="cloud">☁</span>
          <span className="rain rain-one">·</span>
          <span className="rain rain-two">·</span>
          <span className="orbit-line" />
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>Previsões inteligentes para sua mala</span>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Início <span>/</span> Novo roteiro</p>
            <h2>Planeje sua próxima aventura</h2>
          </div>
          <div className="profile" title="Seu perfil">VT</div>
        </header>

        <div className="form-layout">
          <form className="trip-form" onSubmit={submitTrip}>
            <div className="section-heading">
              <div className="step-number">01</div>
              <div>
                <h3>Organize sua mala</h3>
                <p>Informe quantas peças de cada tipo você tem.</p>
              </div>
            </div>

            <div className="clothing-grid">
              {[
                ['calcas', 'Calças'],
                ['camisetas', 'Camisetas'],
                ['shorts', 'Shorts'],
                ['agasalhos', 'Agasalhos'],
              ].map(([type, label]) => (
                <label className="clothing-field" key={type}>
                  <span>{label}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={clothing[type]}
                    onChange={(event) => updateClothing(type, event.target.value)}
                    required
                  />
                  <small>peças</small>
                </label>
              ))}
            </div>

            <div className="section-heading destination-heading">
              <div className="step-number">02</div>
              <div>
                <h3>Monte o roteiro</h3>
                <p>Escolha uma data e informe o endereço de cada dia.</p>
              </div>
            </div>

            <div className="destination-list">
              {destinations.map((destination, index) => (
                <div className="destination-card" key={index}>
                  <div className="day-badge">DIA {String(index + 1).padStart(2, '0')}</div>
                  <div className="destination-fields">
                    <label className="field">
                      <span>Data</span>
                      <input
                        type="date"
                        min={minimumDate}
                        max={maximumDate}
                        value={destination.date}
                        onChange={(event) => updateDestination(index, 'date', event.target.value)}
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Endereço do destino</span>
                      <input
                        type="text"
                        placeholder="Ex.: Av. Paulista, 1578, São Paulo"
                        value={destination.address}
                        onChange={(event) => updateDestination(index, 'address', event.target.value)}
                        required
                      />
                    </label>
                  </div>
                  {destinations.length > 1 && (
                    <button
                      type="button"
                      className="remove-button"
                      aria-label={`Remover dia ${index + 1}`}
                      onClick={() => removeDestination(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" className="add-day-button" onClick={addDestination}>
              <span>+</span> Adicionar outro dia
            </button>

            <div className="form-actions">
              {status === 'error' && <p className="feedback error">{errorMessage}</p>}
              <button className="submit-button" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Salvando...' : 'Gerar recomendações'}
                <span>→</span>
              </button>
            </div>
          </form>

          <aside className="preview-card">
            <div className="preview-top">
              <span className="preview-label">PRÉVIA DO ROTEIRO</span>
              <span className="sparkle">✦</span>
            </div>
            <div className="preview-illustration" aria-hidden="true">
              <span className="preview-sun">☼</span>
              <span className="preview-cloud">☁</span>
              <span className="preview-drop">•</span>
            </div>
            <h3>Sua próxima viagem</h3>
            <p className="preview-caption">
              {destinations.length} {destinations.length === 1 ? 'dia planejado' : 'dias planejados'}
            </p>
            <div className="preview-divider" />
            <ul className="preview-list">
              {destinations.slice(0, 3).map((destination, index) => (
                <li key={index}>
                  <span className="preview-day">D{String(index + 1).padStart(2, '0')}</span>
                  <span>{destination.address || 'Endereço a definir'}</span>
                </li>
              ))}
              {destinations.length > 3 && <li className="more-days">+ {destinations.length - 3} dias</li>}
            </ul>
            <div className="forecast-note">
              <span>☁</span>
              <p>A previsão será consultada automaticamente para cada destino.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default App
