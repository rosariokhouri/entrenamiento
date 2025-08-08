"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Timer, Check, X, Play, Pause, RotateCcw, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { exercises } from "@/lib/exercises-data"
import { useRouter } from "next/navigation"

interface Set {
  weight: number
  reps: number
  rpe?: number
  completed: boolean
}

interface Exercise {
  name: string
  sets: Set[]
  notes?: string
  lastPerformance?: Set[]
}

interface Workout {
  id: string
  date: string
  duration: number
  exercises: Exercise[]
}

export default function WorkoutPage() {
  const router = useRouter()
  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([])
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [restTimer, setRestTimer] = useState(0)
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRestTimerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsRestTimerRunning(false)
            // Podría agregar notificación aquí
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRestTimerRunning, restTimer])

  const addExercise = (exerciseName: string) => {
    if (!startTime) setStartTime(new Date())
    
    const existingExercise = currentWorkout.find(ex => ex.name === exerciseName)
    if (existingExercise) return

    // Obtener último rendimiento del localStorage
    const savedWorkouts = localStorage.getItem('gym-workouts')
    let lastPerformance: Set[] = []
    
    if (savedWorkouts) {
      const workouts: Workout[] = JSON.parse(savedWorkouts)
      const lastWorkoutWithExercise = workouts
        .reverse()
        .find(w => w.exercises.some(ex => ex.name === exerciseName))
      
      if (lastWorkoutWithExercise) {
        const lastExercise = lastWorkoutWithExercise.exercises.find(ex => ex.name === exerciseName)
        if (lastExercise) {
          lastPerformance = lastExercise.sets
        }
      }
    }

    const newExercise: Exercise = {
      name: exerciseName,
      sets: [{ weight: 0, reps: 0, completed: false }],
      lastPerformance
    }

    setCurrentWorkout(prev => [...prev, newExercise])
    setSelectedExercise("")
    setSearchTerm("")
  }

  const addSet = (exerciseIndex: number) => {
    setCurrentWorkout(prev => {
      const updated = [...prev]
      const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1]
      updated[exerciseIndex].sets.push({
        weight: lastSet.weight,
        reps: lastSet.reps,
        completed: false
      })
      return updated
    })
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => {
    setCurrentWorkout(prev => {
      const updated = [...prev]
      updated[exerciseIndex].sets[setIndex] = {
        ...updated[exerciseIndex].sets[setIndex],
        [field]: value
      }
      return updated
    })
  }

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    updateSet(exerciseIndex, setIndex, 'completed', true)
    startRestTimer(90) // 90 segundos de descanso por defecto
  }

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds)
    setIsRestTimerRunning(true)
  }

  const removeExercise = (exerciseIndex: number) => {
    setCurrentWorkout(prev => prev.filter((_, idx) => idx !== exerciseIndex))
  }

  const saveWorkout = () => {
    if (currentWorkout.length === 0) return

    const duration = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000 / 60) : 0
    
    const workout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration,
      exercises: currentWorkout.map(ex => ({
        ...ex,
        sets: ex.sets.filter(set => set.completed)
      })).filter(ex => ex.sets.length > 0)
    }

    const savedWorkouts = localStorage.getItem('gym-workouts')
    const workouts = savedWorkouts ? JSON.parse(savedWorkouts) : []
    workouts.push(workout)
    localStorage.setItem('gym-workouts', JSON.stringify(workouts))

    router.push('/')
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(exercises.map(ex => ex.category)))]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Entrenamiento Actual</h1>
              {startTime && (
                <p className="text-sm text-muted-foreground">
                  Iniciado a las {startTime.toLocaleTimeString('es-AR')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {restTimer > 0 && (
                <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full">
                  <Timer className="h-4 w-4" />
                  <span className="font-mono">{formatTime(restTimer)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => setIsRestTimerRunning(!isRestTimerRunning)}
                  >
                    {isRestTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </div>
              )}
              <Button onClick={saveWorkout} disabled={currentWorkout.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Agregar Ejercicio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Agregar Ejercicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar ejercicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Todas las Categorías" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {filteredExercises.slice(0, 20).map((exercise) => (
                <Button
                  key={exercise.name}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => addExercise(exercise.name)}
                >
                  <div className="text-left">
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{exercise.category}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ejercicios Actuales */}
        {currentWorkout.map((exercise, exerciseIndex) => (
          <Card key={exerciseIndex}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  {exercise.lastPerformance && exercise.lastPerformance.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Último: {exercise.lastPerformance.map(set => `${set.weight}kg × ${set.reps}`).join(', ')}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(exerciseIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Series */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-1">Serie</div>
                  <div className="col-span-3">Peso (kg)</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-2">RPE</div>
                  <div className="col-span-3">Acción</div>
                </div>
                
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-sm font-medium">
                      {setIndex + 1}
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                        disabled={set.completed}
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                        disabled={set.completed}
                        className="h-8"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={set.rpe || ''}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'rpe', parseInt(e.target.value) || undefined)}
                        disabled={set.completed}
                        className="h-8"
                        placeholder="RPE"
                      />
                    </div>
                    <div className="col-span-3">
                      {set.completed ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Hecho
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => completeSet(exerciseIndex, setIndex)}
                          disabled={!set.weight || !set.reps}
                          className="h-8"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Hecho
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSet(exerciseIndex)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Serie
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Timer className="h-4 w-4 mr-1" />
                      Timer Descanso
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Timer de Descanso</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-2">
                      <Button onClick={() => startRestTimer(60)}>1:00</Button>
                      <Button onClick={() => startRestTimer(90)}>1:30</Button>
                      <Button onClick={() => startRestTimer(120)}>2:00</Button>
                      <Button onClick={() => startRestTimer(180)}>3:00</Button>
                      <Button onClick={() => startRestTimer(240)}>4:00</Button>
                      <Button onClick={() => startRestTimer(300)}>5:00</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <Label htmlFor={`notes-${exerciseIndex}`}>Notas</Label>
                <Textarea
                  id={`notes-${exerciseIndex}`}
                  placeholder="Agregar notas sobre este ejercicio..."
                  value={exercise.notes || ''}
                  onChange={(e) => {
                    setCurrentWorkout(prev => {
                      const updated = [...prev]
                      updated[exerciseIndex].notes = e.target.value
                      return updated
                    })
                  }}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {currentWorkout.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Comenzá tu Entrenamiento</h3>
              <p className="text-muted-foreground">Agregá ejercicios para empezar a registrar tu entrenamiento</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
