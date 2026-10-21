export function Portrait({ name, id }: { name: string; id: string }) {
  return (
    <img
      className="portrait"
      src={`/assets/people/${id}.jpg`}
      alt={`Portrait of ${name}, an illustrative guide`}
    />
  )
}
