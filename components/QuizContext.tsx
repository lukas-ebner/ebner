'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface QuizContextValue {
  quizCompleted: boolean
  setQuizCompleted: (v: boolean) => void
}

const QuizContext = createContext<QuizContextValue>({
  quizCompleted: false,
  setQuizCompleted: () => {},
})

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizCompleted, setQuizCompleted] = useState(false)
  return (
    <QuizContext.Provider value={{ quizCompleted, setQuizCompleted }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  return useContext(QuizContext)
}
