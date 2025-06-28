

// Adauga un element in lista daca nu exista deja (dupa valoare simpla)
export const addItem = (inputValue, setInput, list, setList) => {
  const trimmed = inputValue.trim();
  if (trimmed && !list.includes(trimmed)) {
    setList([...list, trimmed]);
    setInput('');
  }
};

// Sterge un element din lista dupa index
export const removeItem = (index, list, setList) => {
  const updated = [...list];
  updated.splice(index, 1);
  setList(updated);
};

// Adauga un obiect FAQ daca intrebarea si raspunsul sunt completate
export const addFaq = (question, answer, faqList, setFaqList, setQuestion, setAnswer) => {
  const trimmedQ = question.trim();
  const trimmedA = answer.trim();

  if (trimmedQ && trimmedA) {
    setFaqList([...faqList, { question: trimmedQ, answer: trimmedA }]);
    setQuestion('');
    setAnswer('');
  }
};

// Sterge un element din lista de FAQ
export const removeFaq = (index, faqList, setFaqList) => {
  const updated = [...faqList];
  updated.splice(index, 1);
  setFaqList(updated);
};

