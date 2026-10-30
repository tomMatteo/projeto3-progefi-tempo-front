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
  const [averageTemp, setAverageTemp] = useState(22)
  const [plan, setPlan] = useState(null)

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
    setPlan(null)

    const apiUrl = import.meta.env.VITE_API_URL

    if (!apiUrl) {
      setStatus('error')
      setErrorMessage('Não foi possível consultar a previsão.')
      return
    }

    const payload = {
      clothes: {
        't-shirt': Number(clothing.camisetas) || 0,
        'long-sleeve': 0,
        pants: Number(clothing.calcas) || 0,
        shorts: Number(clothing.shorts) || 0,
        coat: Number(clothing.agasalhos) || 0,
        'heavy-coat': 0,
        'second-skin': 0,
        gloves: 0,
      },
      itinerary: Object.fromEntries(
        destinations.map((d) => [d.date, d.address]),
      ),
      average_temp: Number(averageTemp),
    }

    setStatus('loading')
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Não achamos esse endereço.'
            : 'Não foi possível consultar a previsão.',
        )
      }

      setPlan(data)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error && error.message === 'Não achamos esse endereço.'
          ? error.message
          : 'Não foi possível consultar a previsão.',
      )
    }
  }

  function updateClothing(type, value) {
    if (value === '') {
      setClothing((current) => ({ ...current, [type]: '' }))
      return
    }

    const parsedValue = Number(value)
    if (Number.isNaN(parsedValue)) return

    setClothing((current) => ({
      ...current,
      [type]: Math.max(0, Math.min(100, parsedValue)),
    }))
  }

  function changeClothing(type, amount) {
    setClothing((current) => ({
      ...current,
      [type]: Math.max(0, Math.min(100, Number(current[type] || 0) + amount)),
    }))
  }

  function normalizeClothing(type) {
    setClothing((current) => ({
      ...current,
      [type]: current[type] === '' ? 0 : current[type],
    }))
  }

  const totalClothing = Object.values(clothing).reduce(
    (total, amount) => total + Number(amount),
    0,
  )
  const isFormValid =
    totalClothing > 0 &&
    destinations.every(
      (destination) => destination.date && destination.address.trim(),
    )

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
                  <div className="quantity-control">
                    <button
                      type="button"
                      aria-label={`Diminuir quantidade de ${label}`}
                      onClick={() => changeClothing(type, -1)}
                      disabled={Number(clothing[type]) === 0}
                    >
                      −
                    </button>
                    <input
                      className="quantity-input"
                      type="number"
                      min="0"
                      max="100"
                      aria-label={`Quantidade de ${label}`}
                      value={clothing[type]}
                      onChange={(event) => updateClothing(type, event.target.value)}
                      onBlur={() => normalizeClothing(type)}
                      required
                    />
                    <button
                      type="button"
                      aria-label={`Aumentar quantidade de ${label}`}
                      onClick={() => changeClothing(type, 1)}
                      disabled={Number(clothing[type]) === 100}
                    >
                      +
                    </button>
                  </div>
                </label>
              ))}
            </div>
            <p className={`clothing-summary${totalClothing === 0 ? ' empty' : ''}`}>
              {totalClothing} {totalClothing === 1 ? 'peça' : 'peças'} para{' '}
              {destinations.length} {destinations.length === 1 ? 'dia' : 'dias'}
            </p>

            <label className="field">
              <span>Temperatura em que você se sente confortável: {averageTemp}°C</span>
              <input
                type="range"
                min="0"
                max="35"
                value={averageTemp}
                onChange={(event) => setAverageTemp(Number(event.target.value))}
              />
            </label>

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
                    <label className="field date-field">
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
              <button
                className="submit-button"
                type="submit"
                disabled={status === 'loading' || !isFormValid}
              >
                {status === 'loading' ? (
                  <>
                    <span className="loading-label">
                      <span className="spinner" aria-hidden="true" />
                      Consultando previsão…
                    </span>
                    <span aria-hidden="true">→</span>
                  </>
                ) : (
                  <>
                    Gerar recomendações
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {plan && (
            <section className="preview-card">
              <h3>Recomendações</h3>
              {Object.entries(plan).map(([date, { outfit, notes }]) => (
                <div key={date}>
                  <strong>{date.split('-').reverse().join('/')}</strong>
                  <ul>
                    {Object.entries(outfit).map(([piece, count]) => (
                      <li key={piece}>{count}× {piece}</li>
                    ))}
                  </ul>
                  {notes.map((note, i) => (
                    <p key={i} className="feedback">{note}</p>
                  ))}
                </div>
              ))}
            </section>
          )}

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
