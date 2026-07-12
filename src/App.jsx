import { useEffect, useState } from 'react'

const floatingTech = [
  { label: 'React', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', type: 'front', top: '10%', left: '8%', delay: '0s' },
  { label: 'UI', glyph: '▣', type: 'front', top: '36%', left: '82%', delay: '0.8s' },
  { label: 'TypeScript', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg', type: 'front', top: '54%', left: '10%', delay: '1.2s' },
  { label: 'Node.js', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', type: 'back', top: '16%', left: '78%', delay: '0.4s' },
  { label: 'API', glyph: 'API', type: 'back', top: '72%', left: '79%', delay: '1.6s' },
  { label: 'Git', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', type: 'back', top: '78%', left: '18%', delay: '2s' },
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

      const resposta = await fetch('https://readme-generator-api.onrender.com/api/generate', {
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

    // Cria o arquivo virtual com o conteúdo gerado
    const blob = new Blob([readmeGerado], { type: 'text/markdown;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'README.md'
    link.click()

    window.URL.revokeObjectURL(url)
  }

  const alternarTema = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <div className="floating-tech-layer" aria-hidden="true">
        {floatingTech.map((item) => (
          <div
            key={item.label}
            className={`floating-tech floating-tech--${item.type}`}
            style={{ top: item.top, left: item.left, animationDelay: item.delay }}
          >
            {item.image ? (
              <img src={item.image} alt={`Ícone do ${item.label}`} className="floating-tech__image" />
            ) : (
              <span className="floating-tech__glyph">{item.glyph}</span>
            )}
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

            <button
              type="button"
              className="theme-toggle"
              onClick={alternarTema}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                // Icone de Sol
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                // Icone de Lua
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
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
              {readmeGerado && (
                <div className="ai-warning-box">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ai-warning-icon"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <p>
                    <strong>Aviso:</strong> Este README foi gerado por Inteligência Artificial lendo o seu código. A IA pode cometer erros ou omitir contextos de negócios. <strong>Sempre revise o arquivo</strong> antes de publicá-lo no seu repositório.
                  </p>
                </div>
              )}
              <textarea readOnly className="result-output" value={readmeGerado} />
            </section>
          )}

          <footer className="panel-footer">
            <span>Feito por <a className='eu' href="https://github.com/Amand4May" target="_blank" rel="noopener noreferrer">@Amand4May</a>.</span>
          </footer>
        </section>
      </main>
    </div>
  )
}



export default App