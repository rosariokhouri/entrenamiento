"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, Dumbbell, Clock, Target, Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Link from "next/link"

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

interface Stats {
  totalWorkouts: number
  weeklyVolume: number
  recentPRs: number
  currentStreak: number
  avgDuration: number
}

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([])
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    weeklyVolume: 0,
    recentPRs: 0,
    currentStreak: 0,
    avgDuration: 0
  })

  useEffect(() => {
    // Cargar datos del localStorage
    const savedWorkouts = localStorage.getItem('gym-workouts')
    if (savedWorkouts) {
      const parsedWorkouts = JSON.parse(savedWorkouts)
      setWorkouts(parsedWorkouts)
      calculateStats(parsedWorkouts)
    }
  }, [])

  const calculateStats = (workoutData: WorkoutData[]) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const recentWorkouts = workoutData.filter(w => new Date(w.date) >= weekAgo)
    const weeklyVolume = recentWorkouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal, exercise) => {
        return exerciseTotal + exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight * set.reps)
        }, 0)
      }, 0)
    }, 0)

    setStats({
      totalWorkouts: workoutData.length,
      weeklyVolume: Math.round(weeklyVolume),
      recentPRs: 3, // Esto se calcularía basado en detección de PRs
      currentStreak: 5, // Esto se calcularía basado en días consecutivos de entrenamiento
      avgDuration: workoutData.length > 0 ? Math.round(workoutData.reduce((sum, w) => sum + w.duration, 0) / workoutData.length) : 0
    })
  }

  const weeklyData = [
    { day: 'Lun', volume: 2400 },
    { day: 'Mar', volume: 0 },
    { day: 'Mié', volume: 3200 },
    { day: 'Jue', volume: 0 },
    { day: 'Vie', volume: 2800 },
    { day: 'Sáb', volume: 3600 },
    { day: 'Dom', volume: 0 },
  ]

  const progressData = [
    { week: 'S1', benchPress: 80, squat: 100, deadlift: 120 },
    { week: 'S2', benchPress: 82.5, squat: 105, deadlift: 125 },
    { week: 'S3', benchPress: 85, squat: 107.5, deadlift: 130 },
    { week: 'S4', benchPress: 87.5, squat: 110, deadlift: 135 },
  ]

  const recentWorkouts = workouts.slice(-3).reverse()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel Principal</h1>
              <p className="text-muted-foreground">¡Bienvenido de vuelta! ¿Listo para entrenar?</p>
            </div>
            <Link href="/workout">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Iniciar Entrenamiento
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Entrenamientos</p>
                  <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Volumen Semanal</p>
                  <p className="text-2xl font-bold">{stats.weeklyVolume.toLocaleString()}</p>
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
                  <p className="text-sm text-muted-foreground">RPs Recientes</p>
                  <p className="text-2xl font-bold">{stats.recentPRs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Racha Actual</p>
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">días</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Duración Prom.</p>
                  <p className="text-2xl font-bold">{stats.avgDuration}</p>
                  <p className="text-xs text-muted-foreground">min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Gráfico de Volumen Semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Volumen Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  volume: {
                    label: "Volumen (kg)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="volume" fill="var(--color-volume)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Progreso */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso de Fuerza</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  benchPress: {
                    label: "Press Banca",
                    color: "hsl(var(--chart-1))",
                  },
                  squat: {
                    label: "Sentadilla",
                    color: "hsl(var(--chart-2))",
                  },
                  deadlift: {
                    label: "Peso Muerto",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="benchPress" stroke="var(--color-benchPress)" strokeWidth={2} />
                    <Line type="monotone" dataKey="squat" stroke="var(--color-squat)" strokeWidth={2} />
                    <Line type="monotone" dataKey="deadlift" stroke="var(--color-deadlift)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Entrenamientos Recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Entrenamientos Recientes</CardTitle>
            <Link href="/history">
              <Button variant="outline" size="sm">Ver Todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aún no hay entrenamientos. ¡Empezá tu primer entrenamiento!</p>
                <Link href="/workout">
                  <Button className="mt-4">Iniciar Entrenamiento</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(workout.date).toLocaleDateString('es-AR')}</p>
                      <p className="text-sm text-muted-foreground">
                        {workout.exercises.length} ejercicios • {workout.duration} min
                      </p>
                      <div className="flex gap-1 mt-2">
                        {workout.exercises.slice(0, 3).map((exercise, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {exercise.name}
                          </Badge>
                        ))}
                        {workout.exercises.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{workout.exercises.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} series
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(workout.exercises.reduce((total, ex) => 
                          total + ex.sets.reduce((setTotal, set) => setTotal + (set.weight * set.reps), 0), 0
                        )).toLocaleString()} kg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/templates">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium">Plantillas</h3>
                <p className="text-sm text-muted-foreground">Usar rutinas guardadas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/exercises">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Dumbbell className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium">Base de Ejercicios</h3>
                <p className="text-sm text-muted-foreground">Explorar ejercicios</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium">Análisis de Progreso</h3>
                <p className="text-sm text-muted-foreground">Estadísticas detalladas</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
