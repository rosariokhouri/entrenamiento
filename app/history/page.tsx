"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, Dumbbell, Search, Filter, Trash2, Eye } from 'lucide-react'

interface WorkoutData {
  id: string
  date: string
  duration: number
  exercises: Array<{
    name: string
    sets: Array<{
      weight: number
      reps: number
      rpe?: number
    }>
    notes?: string
  }>
}

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutData | null>(null)

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('gym-workouts')
    if (savedWorkouts) {
      const parsedWorkouts = JSON.parse(savedWorkouts)
      setWorkouts(parsedWorkouts)
      setFilteredWorkouts(parsedWorkouts)
    }
  }, [])

  useEffect(() => {
    let filtered = workouts.filter(workout => {
      const searchLower = searchTerm.toLowerCase()
      return workout.exercises.some(exercise => 
        exercise.name.toLowerCase().includes(searchLower)
      ) || new Date(workout.date).toLocaleDateString('es-AR').includes(searchTerm)
    })

    // Ordenar entrenamientos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "duration-desc":
          return b.duration - a.duration
        case "duration-asc":
          return a.duration - b.duration
        case "volume-desc":
          const volumeB = b.exercises.reduce((sum, ex) => 
            sum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0)
          const volumeA = a.exercises.reduce((sum, ex) => 
            sum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0)
          return volumeB - volumeA
        default:
          return 0
      }
    })

    setFilteredWorkouts(filtered)
  }, [workouts, searchTerm, sortBy])

  const deleteWorkout = (workoutId: string) => {
    const updatedWorkouts = workouts.filter(w => w.id !== workoutId)
    setWorkouts(updatedWorkouts)
    localStorage.setItem('gym-workouts', JSON.stringify(updatedWorkouts))
  }

  const calculateWorkoutVolume = (workout: WorkoutData) => {
    return workout.exercises.reduce((total, exercise) => 
      total + exercise.sets.reduce((setTotal, set) => setTotal + (set.weight * set.reps), 0), 0
    )
  }

  const getWorkoutStats = () => {
    const totalWorkouts = workouts.length
    const totalVolume = workouts.reduce((sum, workout) => sum + calculateWorkoutVolume(workout), 0)
    const avgDuration = workouts.length > 0 ? 
      Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length) : 0
    
    return { totalWorkouts, totalVolume, avgDuration }
  }

  const stats = getWorkoutStats()

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Historial de Entrenamientos</h1>
          <p className="text-muted-foreground">Revisá tus entrenamientos pasados y seguí tu progreso</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Resumen de Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Dumbbell className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Total Entrenamientos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{Math.round(stats.totalVolume / 1000)}k</p>
              <p className="text-sm text-muted-foreground">Volumen Total (kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.avgDuration}</p>
              <p className="text-sm text-muted-foreground">Duración Prom (min)</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar entrenamientos o ejercicios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Más Recientes</SelectItem>
                  <SelectItem value="date-asc">Más Antiguos</SelectItem>
                  <SelectItem value="duration-desc">Mayor Duración</SelectItem>
                  <SelectItem value="duration-asc">Menor Duración</SelectItem>
                  <SelectItem value="volume-desc">Mayor Volumen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Entrenamientos */}
        {filteredWorkouts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {workouts.length === 0 ? "Aún no hay entrenamientos" : "No se encontraron entrenamientos"}
              </h3>
              <p className="text-muted-foreground">
                {workouts.length === 0 
                  ? "¡Empezá tu primer entrenamiento para verlo acá!" 
                  : "Probá ajustando tu búsqueda o filtros"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredWorkouts.map((workout) => (
              <Card key={workout.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-medium">
                          {new Date(workout.date).toLocaleDateString('es-AR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <Badge variant="outline">
                          {new Date(workout.date).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {workout.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-4 w-4" />
                          {workout.exercises.length} ejercicios
                        </div>
                        <div>
                          {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} series
                        </div>
                        <div>
                          {Math.round(calculateWorkoutVolume(workout)).toLocaleString()} kg volumen
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {workout.exercises.slice(0, 4).map((exercise, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {exercise.name}
                          </Badge>
                        ))}
                        {workout.exercises.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{workout.exercises.length - 4} más
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Detalles del Entrenamiento - {new Date(workout.date).toLocaleDateString('es-AR')}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-2xl font-bold">{workout.duration}</p>
                                <p className="text-sm text-muted-foreground">Minutos</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{workout.exercises.length}</p>
                                <p className="text-sm text-muted-foreground">Ejercicios</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold">
                                  {Math.round(calculateWorkoutVolume(workout) / 1000)}k
                                </p>
                                <p className="text-sm text-muted-foreground">Volumen (kg)</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {workout.exercises.map((exercise, idx) => (
                                <div key={idx} className="border rounded-lg p-3">
                                  <h4 className="font-medium mb-2">{exercise.name}</h4>
                                  <div className="space-y-1">
                                    {exercise.sets.map((set, setIdx) => (
                                      <div key={setIdx} className="flex justify-between text-sm">
                                        <span>Serie {setIdx + 1}</span>
                                        <span>
                                          {set.weight}kg × {set.reps} reps
                                          {set.rpe && ` @ RPE ${set.rpe}`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  {exercise.notes && (
                                    <p className="text-sm text-muted-foreground mt-2 italic">
                                      {exercise.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteWorkout(workout.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
