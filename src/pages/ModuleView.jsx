import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getModuleById } from '../data/modules'

export default function ModuleView() {
  const { moduleId } = useParams()
  const module = getModuleById(moduleId)
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!module) return
    setLoading(true)
    fetch(`/content/notes/${module.contentFile}`)
      .then((res) => res.text())
      .then(setMarkdown)
      .finally(() => setLoading(false))
  }, [module])

  if (!module) return <p>Moduli haipo.</p>

  return (
    <div className="module-view">
      <div className="mod-number">SEMINA {module.order}</div>
      <h1>{module.title}</h1>
      <p className="subtitle">{module.subtitle}</p>

      {loading ? (
        <p>Inapakia notes…</p>
      ) : (
        <div className="notes-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      )}

      <div className="module-actions">
        <Link to="/dashboard" className="btn btn-secondary">← Rudi kwenye kozi zangu</Link>
        <Link to={`/quiz/${module.id}`} className="btn btn-primary">Fanya Mtihani</Link>
      </div>
    </div>
  )
}
