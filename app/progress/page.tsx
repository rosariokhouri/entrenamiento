"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Target, Calendar, Dumbbell } from 'lucide-react'

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
  }>
}

export default function ProgressPage() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([])
  const [selectedExercise, setSelectedExercise] = useState("")
  const [timeRange, setTimeRange] = useState("3months")

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('gym-workouts')
    if (savedWorkouts) {
      const parsedWorkouts = JSON.parse(savedWorkouts)
      setWorkouts(parsedWorkouts)
      
      // Establecer ejercicio por defecto al más frecuente
      if (parsedWorkouts.length > 0) {
        const exerciseFrequency: { [key: string]: number } = {}
        parsedWorkouts.forEach((workout: WorkoutData) => {
          workout.exercises.forEach(exercise => {
            exerciseFrequency[exercise.name] = (exerciseFrequency[exercise.name] || 0) + 1
          })
        })
        
        const mostFrequent = Object.entries(exerciseFrequency)
          .sort(([,a], [,b]) => b - a)[0]
        
        if (mostFrequent) {
          setSelectedExercise(mostFrequent[0])
        }
      }
    }
  }, [])

  const getExerciseProgress = (exerciseName: string) => {
    const exerciseWorkouts = workouts
      .filter(workout => workout.exercises.some(ex => ex.name === exerciseName))
      .map(workout => {
        const exercise = workout.exercises.find(ex => ex.name === exerciseName)!
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight))
        const totalVolume = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
        const avgRpe = exercise.sets.filter(set => set.rpe).length > 0 
          ? exercise.sets.filter(set => set.rpe).reduce((sum, set) => sum + (set.rpe || 0), 0) / exercise.sets.filter(set => set.rpe).length
          : null

        return {
          date: new Date(workout.date).toLocaleDateString('es-AR'),
          maxWeight,
          totalVolume,
          avgRpe: avgRpe ? Math.round(avgRpe * 10) / 10 : null,
          sets: exercise.sets.length
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return exerciseWorkouts
  }

  const getVolumeByMuscleGroup = () => {
    const muscleGroups: { [key: string]: number } = {}
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        // Categorización simple - en una app real, tendrías un mapeo apropiado
        let category = "Otros"
        const name = exercise.name.toLowerCase()
        
        if (name.includes('press') && (name.includes('banca') || name.includes('pecho'))) {
          category = "Pecho"
        } else if (name.includes('sentadilla') || name.includes('pierna') || name.includes('estocada')) {
          category = "Piernas"
        } else if (name.includes('dominada') || name.includes('remo') || name.includes('jalón')) {
          category = "Espalda"
        } else if (name.includes('press') && name.includes('militar')) {
          category = "Hombros"
        } else if (name.includes('curl') || name.includes('trícep')) {
          category = "Brazos"
        }

        const volume = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
        muscleGroups[category] = (muscleGroups[category] || 0) + volume
      })
    })

    return Object.entries(muscleGroups).map(([group, volume]) => ({
      group,
      volume: Math.round(volume)
    }))
  }

  const getPersonalRecords = () => {
    const prs: { [key: string]: { weight: number, date: string, reps: number } } = {}
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          const currentPR = prs[exercise.name]
          if (!currentPR || set.weight > currentPR.weight) {
            prs[exercise.name] = {
              weight: set.weight,
              date: workout.date,
              reps: set.reps
            }
          }
        })
      })
    })

    return Object.entries(prs)
      .map(([exercise, pr]) => ({
        exercise,
        ...pr,
        date: new Date(pr.date).toLocaleDateString('es-AR')
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10)
  }

  const exerciseNames = Array.from(new Set(
    workouts.flatMap(workout => workout.exercises.map(ex => ex.name))
  )).sort()

  const progressData = selectedExercise ? getExerciseProgress(selectedExercise) : []
  const volumeData = getVolumeByMuscleGroup()
  const personalRecords = getPersonalRecords()

  const totalWorkouts = workouts.length
  const totalVolume = workouts.reduce((sum, workout) => 
    sum + workout.exercises.reduce((exSum, exercise) => 
      exSum + exercise.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0), 0)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Análisis de Progreso</h1>
          <p className="text-muted-foreground">Seguí tus ganancias de fuerza y consistencia de entrenamientos</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Entrenamientos</p>
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Volumen Total</p>
                  <p className="text-2xl font-bold">{Math.round(totalVolume / 1000)}k</p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Records Personales</p>
                  <p className="text-2xl font-bold">{personalRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Prom por Semana</p>
                  <p className="text-2xl font-bold">
                    {totalWorkouts > 0 ? Math.round((totalWorkouts / Math.max(1, Math.ceil((Date.now() - new Date(workouts[0]?.date || Date.now()).getTime()) / (7 * 24 * 60 * 60 * 1000)))) * 10) / 10 : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Progreso de Ejercicio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Progreso por Ejercicio</CardTitle>
              <div className="flex gap-2">
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Seleccionar ejercicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseNames.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 Mes</SelectItem>
                    <SelectItem value="3months">3 Meses</SelectItem>
                    <SelectItem value="6months">6 Meses</SelectItem>
                    <SelectItem value="1year">1 Año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {progressData.length > 0 ? (
              <ChartContainer
                config={{
                  maxWeight: {
                    label: "Peso Máximo (kg)",
                    color: "hsl(var(--chart-1))",
                  },
                  totalVolume: {
                    label: "Volumen Total (kg)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="weight" orientation="left" />
                    <YAxis yAxisId="volume" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      yAxisId="weight"
                      type="monotone" 
                      dataKey="maxWeight" 
                      stroke="var(--color-maxWeight)" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      yAxisId="volume"
                      type="monotone" 
                      dataKey="totalVolume" 
                      stroke="var(--color-totalVolume)" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {exerciseNames.length === 0 ? "No hay datos de entrenamientos disponibles" : "Seleccioná un ejercicio para ver el progreso"}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Volumen por Grupo Muscular */}
          <Card>
            <CardHeader>
              <CardTitle>Volumen por Grupo Muscular</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  volume: {
                    label: "Volumen (kg)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="group" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="volume" fill="var(--color-volume)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Records Personales */}
          <Card>
            <CardHeader>
              <CardTitle>Records Personales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {personalRecords.length > 0 ? personalRecords.map((pr, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{pr.exercise}</p>
                      <p className="text-sm text-muted-foreground">{pr.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{pr.weight} kg</p>
                      <p className="text-sm text-muted-foreground">{pr.reps} reps</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4" />
                    <p>Aún no hay records personales</p>
                    <p className="text-sm">¡Completá algunos entrenamientos para ver tus RPs!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
