import { useEffect, useState } from 'react'

const backgroundVideoUrl = ''

const floatingTech = [
  { label: 'React', glyph: '</>', type: 'front', top: '10%', left: '8%', delay: '0s' },
  { label: 'UI', glyph: '▣', type: 'front', top: '24%', left: '82%', delay: '0.8s' },
  { label: 'TypeScript', glyph: 'TS', type: 'front', top: '62%', left: '10%', delay: '1.2s' },
  { label: 'Node.js', glyph: '{}', type: 'back', top: '18%', left: '70%', delay: '0.4s' },
  { label: 'API', glyph: 'API', type: 'back', top: '72%', left: '76%', delay: '1.6s' },
  { label: 'Git', glyph: '≋', type: 'back', top: '78%', left: '18%', delay: '2s' },
]

function App() {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tecnologias: ''
  })

  const [generationMode, setGenerationMode] = useState('manual')
  const [projectZip, setProjectZip] = useState(null)
  const [readmeGerado, setReadmeGerado] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dark'
    }

    const savedTheme = window.localStorage.getItem('theme')

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleZipChange = (e) => {
    const selectedFile = e.target.files?.[0] ?? null

    if (selectedFile && selectedFile.type !== 'application/zip' && !selectedFile.name.toLowerCase().endsWith('.zip')) {
      alert('Envie um arquivo .zip válido.')
      e.target.value = ''
      setProjectZip(null)
      return
    }

    setProjectZip(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setReadmeGerado('')

    try {
      const shouldUseZip = generationMode === 'rag' && projectZip
      const payload = shouldUseZip ? new FormData() : null

      if (shouldUseZip) {
        payload.append('nome', formData.nome)
        payload.append('modo', 'rag')
        payload.append('arquivoZip', projectZip)

        if (formData.tecnologias.trim()) {
          payload.append('tecnologias', formData.tecnologias)
        }

        if (formData.descricao.trim()) {
          payload.append('descricao', formData.descricao)
        }
      }

      const resposta = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: shouldUseZip ? undefined : { 'Content-Type': 'application/json' },
        body: shouldUseZip
          ? payload
          : JSON.stringify({
              ...formData,
              modo: 'manual',
            })
      })

      const dados = await resposta.json()
      
      if (dados.readme) {
        setReadmeGerado(dados.readme)
      } else {
        alert("Erro: Não foi possível gerar o README.")
      }

    } catch (erro) {
      console.error("Erro na requisição:", erro)
      alert("Erro ao conectar com o servidor. Verifique se a API está rodando.")
    } finally {
      setLoading(false)
    }
    
  }

  const copiarParaAreaDeTransferencia = () => {
    navigator.clipboard.writeText(readmeGerado)
    alert("README copiado com sucesso!")
  }

  const baixarReadme = () => {
    if (!readmeGerado) {
      return
    }

    const nomeArquivo = (formData.nome || 'README')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'readme'

    const blob = new Blob([readmeGerado], { type: 'text/markdown;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${nomeArquivo}.md`
    link.click()

    window.URL.revokeObjectURL(url)
  }

  const alternarTema = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <div className="video-layer" aria-hidden="true">
        <video className="background-video" autoPlay loop muted playsInline preload="auto" poster="">
          <source src={backgroundVideoUrl} type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>

      <div className="floating-tech-layer" aria-hidden="true">
        {floatingTech.map((item) => (
          <div
            key={item.label}
            className={`floating-tech floating-tech--${item.type}`}
            style={{ top: item.top, left: item.left, animationDelay: item.delay }}
          >
            <span className="floating-tech__glyph">{item.glyph}</span>
            <span className="floating-tech__label">{item.label}</span>
          </div>
        ))}
      </div>

      <main className="app-frame">
        <section className="app-panel">
          <div className="panel-topbar">
            <div>
              <p className="eyebrow">AI README studio</p>
              <h1>Gerador de README</h1>
              <p className="hero-copy">
                Gere um README completo para o seu projeto em segundos, usando inteligência artificial. Basta preencher os campos abaixo e clicar em "Gerar README com IA".
              </p>
            </div>

            <button type="button" className="theme-toggle" onClick={alternarTema}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>

          <form className="project-form" onSubmit={handleSubmit}>
            <div className="mode-switcher" role="tablist" aria-label="Modo de geração do README">
              <button
                type="button"
                className={generationMode === 'manual' ? 'mode-switcher__button is-active' : 'mode-switcher__button'}
                onClick={() => setGenerationMode('manual')}
              >
                Escrever manualmente
              </button>
              <button
                type="button"
                className={generationMode === 'rag' ? 'mode-switcher__button is-active' : 'mode-switcher__button'}
                onClick={() => setGenerationMode('rag')}
              >
                Enviar ZIP + RAG
              </button>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Nome do Projeto</span>
                <input
                  type="text"
                  name="nome"
                  id="nome"
                  required
                  placeholder="Ex: README Generator"
                  value={formData.nome}
                  onChange={handleChange}
                />
              </label>

              {generationMode === 'manual' ? (
                <>
                  <label className="field">
                    <span>Tecnologias Utilizadas</span>
                    <input
                      type="text"
                      name="tecnologias"
                      id="tecnologias"
                      required
                      placeholder="Ex: React, Node.js, Tailwind, ESP32"
                      value={formData.tecnologias}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="field field--full">
                    <span>O que o projeto faz?</span>
                    <textarea
                      name="descricao"
                      id="descricao"
                      rows="5"
                      required
                      placeholder="Descreva as principais funcionalidades e o objetivo do projeto..."
                      value={formData.descricao}
                      onChange={handleChange}
                    />
                  </label>
                </>
              ) : (
                <label className="field field--full upload-field">
                  <span>Arquivo ZIP do projeto</span>
                  <input
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    onChange={handleZipChange}
                    required={generationMode === 'rag'}
                  />
                  <small>
                    Envie o projeto compactado para a IA ler a estrutura, arquivos e contexto automaticamente.
                  </small>
                </label>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading
                ? 'Gerando documentação...'
                : generationMode === 'rag'
                  ? 'Gerar README com RAG'
                  : 'Gerar README com IA'}
            </button>
          </form>

          {readmeGerado && (
            <section className="result-panel">
              <div className="result-header">
                <h2>Resultado</h2>
                <div className="result-actions">
                  <button type="button" onClick={copiarParaAreaDeTransferencia} className="copy-button">
                    Copiar Markdown
                  </button>
                  <button type="button" onClick={baixarReadme} className="copy-button copy-button--secondary">
                    Baixar .md
                  </button>
                </div>
              </div>
              <textarea readOnly className="result-output" value={readmeGerado} />
            </section>
          )}

          <footer className="panel-footer">
            <span>Feito por <a className='eu' href="https://github.com/Amand4May" target="_blank" rel="noopener noreferrer">@Amand4May</a></span>
            <span>Interface, animação e leitura responsiva em um só lugar.</span>
          </footer>
        </section>
      </main>
    </div>
  )
}



export default App