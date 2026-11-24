function enLigne(texte) {
  return texte.split(/(\*\*[^*]+\*\*)/g).map((morceau, i) =>
    morceau.length > 4 && morceau.startsWith('**') && morceau.endsWith('**')
      ? <strong key={i}>{morceau.slice(2, -2)}</strong>
      : morceau
  );
}

export default function TexteArticle({ contenu }) {
  const blocs = contenu.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <>
      {blocs.map((b, i) => {
        if (b.startsWith('## ')) return <h2 key={i}>{enLigne(b.slice(3))}</h2>;
        if (b.startsWith('> ')) {
          return <blockquote key={i}>{enLigne(b.replace(/^> ?/gm, ' ').trim())}</blockquote>;
        }
        if (b.startsWith('- ')) {
          return (
            <ul key={i}>
              {b.split('\n').map((ligne, j) => (
                <li key={j}>{enLigne(ligne.replace(/^- /, ''))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{enLigne(b.replace(/\n/g, ' '))}</p>;
      })}
    </>
  );
}
