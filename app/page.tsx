"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Calendar, Clock, Dumbbell, TrendingUp, Target, Plus, History, BarChart3 } from "lucide-react"
import Link from "next/link"

interface WorkoutData {
  id: string
  name: string
  date: string
  duration: number
  exercises: Array<{
    id: string
    name: string
    category: string
    sets: Array<{
      weight: number
      reps: number
      rpe?: number
    }>
  }>
}

interface DashboardStats {
  totalWorkouts: number
  totalVolume: number
  avgDuration: number
  weeklyWorkouts: number
  currentStreak: number
  favoriteExercise: string
  recentWorkouts: WorkoutData[]
  weeklyProgress: Array<{
    day: string
    workouts: number
    volume: number
  }>
  monthlyVolume: Array<{
    week: string
    volume: number
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Buenos días")
    } else if (hour < 18) {
      setGreeting("Buenas tardes")
    } else {
      setGreeting("Buenas noches")
    }

    // Load workout data and calculate stats
    const loadDashboardData = () => {
      const workouts: WorkoutData[] = JSON.parse(localStorage.getItem("workouts") || "[]")

      if (workouts.length === 0) {
        setStats({
          totalWorkouts: 0,
          totalVolume: 0,
          avgDuration: 0,
          weeklyWorkouts: 0,
          currentStreak: 0,
          favoriteExercise: "Ninguno aún",
          recentWorkouts: [],
          weeklyProgress: [],
          monthlyVolume: [],
        })
        return
      }

      // Calculate total volume
      const totalVolume = workouts.reduce((sum, workout) => {
        return (
          sum +
          workout.exercises.reduce((exerciseSum, exercise) => {
            return (
              exerciseSum +
              exercise.sets.reduce((setSum, set) => {
                return setSum + set.weight * set.reps
              }, 0)
            )
          }, 0)
        )
      }, 0)

      // Calculate average duration
      const avgDuration = Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length)

      // Calculate weekly workouts (last 7 days)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const weeklyWorkouts = workouts.filter((w) => new Date(w.date) >= oneWeekAgo).length

      // Calculate current streak
      const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      let currentStreak = 0
      let currentDate = new Date()

      for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date)
        const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff <= 1) {
          currentStreak++
          currentDate = workoutDate
        } else {
          break
        }
      }

      // Find favorite exercise (most frequently used)
      const exerciseCount: { [key: string]: number } = {}
      workouts.forEach((workout) => {
        workout.exercises.forEach((exercise) => {
          exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1
        })
      })

      const favoriteExercise =
        Object.keys(exerciseCount).length > 0
          ? Object.entries(exerciseCount).sort(([, a], [, b]) => b - a)[0][0]
          : "Ninguno aún"

      // Get recent workouts (last 5)
      const recentWorkouts = sortedWorkouts.slice(0, 5)

      // Calculate weekly progress (last 7 days)
      const weeklyProgress = []
      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayWorkouts = workouts.filter((w) => {
          const workoutDate = new Date(w.date)
          return workoutDate.toDateString() === date.toDateString()
        })

        const dayVolume = dayWorkouts.reduce((sum, workout) => {
          return (
            sum +
            workout.exercises.reduce((exerciseSum, exercise) => {
              return (
                exerciseSum +
                exercise.sets.reduce((setSum, set) => {
                  return setSum + set.weight * set.reps
                }, 0)
              )
            }, 0)
          )
        }, 0)

        weeklyProgress.push({
          day: dayNames[date.getDay()],
          workouts: dayWorkouts.length,
          volume: dayVolume,
        })
      }

      // Calculate monthly volume (last 4 weeks)
      const monthlyVolume = []
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - i * 7 - 6)
        const weekEnd = new Date()
        weekEnd.setDate(weekEnd.getDate() - i * 7)

        const weekWorkouts = workouts.filter((w) => {
          const workoutDate = new Date(w.date)
          return workoutDate >= weekStart && workoutDate <= weekEnd
        })

        const weekVolume = weekWorkouts.reduce((sum, workout) => {
          return (
            sum +
            workout.exercises.reduce((exerciseSum, exercise) => {
              return (
                exerciseSum +
                exercise.sets.reduce((setSum, set) => {
                  return setSum + set.weight * set.reps
                }, 0)
              )
            }, 0)
          )
        }, 0)

        monthlyVolume.push({
          week: `Sem ${4 - i}`,
          volume: weekVolume,
        })
      }

      setStats({
        totalWorkouts: workouts.length,
        totalVolume: Math.round(totalVolume),
        avgDuration,
        weeklyWorkouts,
        currentStreak,
        favoriteExercise,
        recentWorkouts,
        weeklyProgress,
        monthlyVolume,
      })
    }

    loadDashboardData()
  }, [])

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const chartConfig = {
    workouts: {
      label: "Entrenamientos",
      color: "hsl(var(--chart-1))",
    },
    volume: {
      label: "Volumen",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{greeting}</h1>
        <p className="text-muted-foreground">
          {stats.totalWorkouts > 0
            ? `Has completado ${stats.totalWorkouts} entrenamientos. ¡Sigue así!`
            : "¡Bienvenido! Comienza tu primer entrenamiento."}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/workout">
          <Button className="w-full h-20 flex flex-col gap-2">
            <Plus className="h-6 w-6" />
            <span>Nuevo Entrenamiento</span>
          </Button>
        </Link>

        <Link href="/history">
          <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
            <History className="h-6 w-6" />
            <span>Historial</span>
          </Button>
        </Link>

        <Link href="/analytics">
          <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
            <BarChart3 className="h-6 w-6" />
            <span>Analytics</span>
          </Button>
        </Link>

        <Link href="/progress">
          <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
            <TrendingUp className="h-6 w-6" />
            <span>Progreso</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyWorkouts}</div>
            <p className="text-xs text-muted-foreground">entrenamientos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalVolume / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">kg levantados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}</div>
            <p className="text-xs text-muted-foreground">minutos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">días consecutivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Semanal</CardTitle>
            <CardDescription>Entrenamientos de los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="workouts" fill="var(--color-workouts)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volumen Mensual</CardTitle>
            <CardDescription>Progreso de las últimas 4 semanas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="volume" stroke="var(--color-volume)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Entrenamientos Recientes</CardTitle>
            <CardDescription>Tus últimas 5 sesiones</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {stats.recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{workout.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.date).toLocaleDateString("es-ES", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{workout.duration} min</p>
                      <p className="text-xs text-muted-foreground">{workout.exercises.length} ejercicios</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay entrenamientos aún</p>
                <Link href="/workout">
                  <Button className="mt-2">Comenzar Primer Entrenamiento</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>Estadísticas y recomendaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ejercicio Favorito</span>
                <span className="font-medium">{stats.favoriteExercise}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Consistencia Semanal</span>
                  <span className="font-medium">{Math.round((stats.weeklyWorkouts / 3) * 100)}%</span>
                </div>
                <Progress value={Math.min((stats.weeklyWorkouts / 3) * 100, 100)} />
              </div>
            </div>

            {stats.totalWorkouts > 0 && (
              <div className="space-y-3">
                {stats.weeklyWorkouts >= 3 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ¡Excelente!
                    </Badge>
                    <span className="text-sm">Consistencia semanal perfecta</span>
                  </div>
                )}

                {stats.currentStreak >= 3 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Racha
                    </Badge>
                    <span className="text-sm">{stats.currentStreak} días consecutivos</span>
                  </div>
                )}

                {stats.totalVolume > 10000 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Fuerza
                    </Badge>
                    <span className="text-sm">Más de 10k kg levantados</span>
                  </div>
                )}
              </div>
            )}

            {stats.totalWorkouts === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">¡Comienza tu viaje fitness hoy!</p>
                <Link href="/workout">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Primer Entrenamiento
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
