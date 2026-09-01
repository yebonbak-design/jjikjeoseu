import { MOOD_LABEL, spriteFor } from '../lib/mood'
import type { CompanionDef, Mood } from '../types'

export function MeadowScene({
  mood,
  companions,
  speech,
}: {
  mood: Mood
  companions: CompanionDef[]
  speech: string
}) {
  return (
    <div className={`grove mood-${mood}`}>
      <div className={`stroll stroll-${mood}`}>
        <div className="jjik-talk">
          <p className="jjik-bubble">{speech}</p>
          <img src={spriteFor(mood)} alt={`찍저스 · ${MOOD_LABEL[mood]}`} className="jjik" />
        </div>
        {companions.map((p) => (
          <img key={p.id} src={p.image} alt={p.name} className="pal-img" title={p.name} />
        ))}
      </div>
      <p className="mood-caption">{MOOD_LABEL[mood]}</p>
    </div>
  )
}
