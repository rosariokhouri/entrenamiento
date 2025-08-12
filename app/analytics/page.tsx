"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Calendar, Clock, Target, Award, Activity, Dumbbell } from "lucide-react"

export default function AnalyticsPage() {
  const [workouts, setWorkouts] = useState([])
  const [timeFilter, setTimeFilter] = useState("3months")
  const [selectedMetric, setSelectedMetric] = useState("volume")

  useEffect(() => {
    try {
      const savedWorkouts = localStorage.getItem("gym-workouts")
      if (savedWorkouts) {
        const parsed = JSON.parse(savedWorkouts)
        setWorkouts(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error("Error loading workouts:", error)
      setWorkouts([])
    }
  }, [])

  // Filtrar workouts por tiempo
  const getFilteredWorkouts = () => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (timeFilter) {
      case "1month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case "3months":
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case "6months":
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case "1year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return workouts || []
    }

    return (workouts || []).filter((workout) => workout && workout.date && new Date(workout.date) >= cutoffDate)
  }

  const filteredWorkouts = getFilteredWorkouts()

  // Calcular métricas principales
  const totalWorkouts = filteredWorkouts.length
  const totalVolume = filteredWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0)
  const avgDuration =
    totalWorkouts > 0
      ? Math.round(filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / totalWorkouts / 60)
      : 0

  // Calcular ganancias de fuerza (comparar primeros vs últimos workouts)
  const getStrengthGains = () => {
    if (filteredWorkouts.length < 2) return 0

    const firstHalf = filteredWorkouts.slice(-Math.ceil(filteredWorkouts.length / 2))
    const secondHalf = filteredWorkouts.slice(0, Math.floor(filteredWorkouts.length / 2))

    const firstHalfAvg = firstHalf.reduce((sum, w) => sum + (w.totalVolume || 0), 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, w) => sum + (w.totalVolume || 0), 0) / secondHalf.length

    return secondHalfAvg > 0 ? Math.round(((firstHalfAvg - secondHalfAvg) / secondHalfAvg) * 100) : 0
  }

  const strengthGains = getStrengthGains()

  // Datos para gráfico de tendencias
  const getTrendData = () => {
    const sortedWorkouts = [...filteredWorkouts].sort((a, b) => new Date(a.date) - new Date(b.date))

    return sortedWorkouts.map((workout, index) => {
      const date = new Date(workout.date)
      return {
        date: date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        volume: workout.totalVolume || 0,
        avgWeight: workout.exercises
          ? workout.exercises.reduce((sum, ex) => {
              const sets = ex.sets || []
              const totalWeight = sets.reduce((s, set) => s + (Number.parseFloat(set.weight) || 0), 0)
              return sum + (sets.length > 0 ? totalWeight / sets.length : 0)
            }, 0) / workout.exercises.length
          : 0,
        duration: Math.round((workout.duration || 0) / 60),
        rpe: workout.exercises
          ? workout.exercises.reduce((sum, ex) => {
              const sets = ex.sets || []
              const totalRpe = sets.reduce((s, set) => s + (Number.parseFloat(set.rpe) || 0), 0)
              return sum + (sets.length > 0 ? totalRpe / sets.length : 0)
            }, 0) / workout.exercises.length
          : 0,
        exercises: workout.exercises ? workout.exercises.length : 0,
        sets: workout.totalSets || 0,
      }
    })
  }

  const trendData = getTrendData()

  // Datos para distribución por grupos musculares
  const getMuscleGroupData = () => {
    const muscleGroups = {}

    filteredWorkouts.forEach((workout) => {
      if (workout.exercises) {
        workout.exercises.forEach((exercise) => {
          const category = exercise.category || "Otro"
          if (!muscleGroups[category]) {
            muscleGroups[category] = 0
          }
          muscleGroups[category] += (exercise.sets || []).length
        })
      }
    })

    const total = Object.values(muscleGroups).reduce((sum, count) => sum + count, 0)

    return Object.entries(muscleGroups)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }

  const muscleGroupData = getMuscleGroupData()

  // Colores para el gráfico de torta
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00", "#ff00ff"]

  // Datos para análisis por día de la semana
  const getDayAnalysis = () => {
    const dayData = {
      Lun: { workouts: 0, volume: 0, duration: 0 },
      Mar: { workouts: 0, volume: 0, duration: 0 },
      Mié: { workouts: 0, volume: 0, duration: 0 },
      Jue: { workouts: 0, volume: 0, duration: 0 },
      Vie: { workouts: 0, volume: 0, duration: 0 },
      Sáb: { workouts: 0, volume: 0, duration: 0 },
      Dom: { workouts: 0, volume: 0, duration: 0 },
    }

    filteredWorkouts.forEach((workout) => {
      const date = new Date(workout.date)
      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      const day = dayNames[date.getDay()]

      if (dayData[day]) {
        dayData[day].workouts += 1
        dayData[day].volume += workout.totalVolume || 0
        dayData[day].duration += workout.duration || 0
      }
    })

    return Object.entries(dayData).map(([day, data]) => ({
      day,
      workouts: data.workouts,
      avgVolume: data.workouts > 0 ? Math.round(data.volume / data.workouts) : 0,
      avgDuration: data.workouts > 0 ? Math.round(data.duration / data.workouts / 60) : 0,
    }))
  }

  const dayAnalysis = getDayAnalysis()

  // Insights y recomendaciones
  const getInsights = () => {
    const insights = []

    // Consistencia
    const weeksInPeriod =
      timeFilter === "1month" ? 4 : timeFilter === "3months" ? 12 : timeFilter === "6months" ? 24 : 52
    const workoutsPerWeek = totalWorkouts / weeksInPeriod

    if (workoutsPerWeek >= 3) {
      insights.push({
        type: "success",
        title: "¡Excelente Consistencia!",
        description: `Promedio de ${workoutsPerWeek.toFixed(1)} entrenamientos por semana`,
        icon: Award,
      })
    } else if (workoutsPerWeek < 2) {
      insights.push({
        type: "warning",
        title: "Mejorar Consistencia",
        description: "Intentá entrenar al menos 2-3 veces por semana para mejores resultados",
        icon: Calendar,
      })
    }

    // Progreso de volumen
    if (strengthGains > 10) {
      insights.push({
        type: "success",
        title: "¡Progreso Excepcional!",
        description: `${strengthGains}% de aumento en volumen de entrenamiento`,
        icon: TrendingUp,
      })
    } else if (strengthGains < -5) {
      insights.push({
        type: "warning",
        title: "Volumen Decreciente",
        description: "Considerá aumentar gradualmente el peso o repeticiones",
        icon: TrendingDown,
      })
    }

    // Duración de entrenamientos
    if (avgDuration > 90) {
      insights.push({
        type: "info",
        title: "Entrenamientos Largos",
        description: "Considerá optimizar el tiempo de descanso para mayor eficiencia",
        icon: Clock,
      })
    }

    // Logros
    if (totalWorkouts >= 50) {
      insights.push({
        type: "achievement",
        title: "¡50+ Entrenamientos!",
        description: "Has completado más de 50 entrenamientos. ¡Increíble dedicación!",
        icon: Target,
      })
    }

    return insights
  }

  const insights = getInsights()

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Análisis detallado de tu progreso</p>
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Último mes</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="1year">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Métricas Principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entrenamientos</p>
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volumen Total</p>
                  <p className="text-2xl font-bold">{Math.round(totalVolume).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duración Promedio</p>
                  <p className="text-2xl font-bold">{avgDuration}</p>
                  <p className="text-xs text-muted-foreground">minutos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ganancias</p>
                  <p className="text-2xl font-bold">
                    {strengthGains > 0 ? "+" : ""}
                    {strengthGains}%
                  </p>
                  <p className="text-xs text-muted-foreground">fuerza</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Análisis */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="distribution">Distribución</TabsTrigger>
            <TabsTrigger value="intensity">Intensidad</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Tendencias */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Progreso Temporal</CardTitle>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volume">Volumen</SelectItem>
                      <SelectItem value="avgWeight">Peso Promedio</SelectItem>
                      <SelectItem value="duration">Duración</SelectItem>
                      <SelectItem value="rpe">RPE Promedio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey={selectedMetric} stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Volumen vs Duración</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ejercicios y Series por Sesión</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="exercises" fill="#8884d8" />
                      <Bar dataKey="sets" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Distribución */}
          <TabsContent value="distribution" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Grupos Musculares</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={muscleGroupData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {muscleGroupData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalle por Grupo Muscular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {muscleGroupData.map((group, index) => (
                      <div key={group.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{group.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {group.value} series ({group.percentage}%)
                          </span>
                        </div>
                        <Progress value={group.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Intensidad */}
          <TabsContent value="intensity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis por Día de la Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dayAnalysis} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="day" type="category" />
                    <Tooltip />
                    <Bar dataKey="avgVolume" fill="#8884d8" />
                    <Bar dataKey="avgDuration" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {dayAnalysis.map((day) => (
                <Card key={day.day}>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-medium mb-2">{day.day}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{day.workouts} entrenamientos</p>
                      <p className="text-sm">{day.avgVolume} kg promedio</p>
                      <p className="text-sm">{day.avgDuration} min promedio</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logros y Hitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {totalWorkouts >= 10 && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <Award className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Constancia</p>
                          <p className="text-sm text-muted-foreground">10+ entrenamientos completados</p>
                        </div>
                      </div>
                    )}

                    {totalVolume >= 10000 && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <Dumbbell className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Fuerza</p>
                          <p className="text-sm text-muted-foreground">+10,000 kg levantados</p>
                        </div>
                      </div>
                    )}

                    {filteredWorkouts.filter((w) => w.exercises && w.exercises.length >= 5).length >= 5 && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Variedad</p>
                          <p className="text-sm text-muted-foreground">5+ ejercicios por sesión</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          insight.type === "success"
                            ? "bg-green-50 dark:bg-green-950"
                            : insight.type === "warning"
                              ? "bg-yellow-50 dark:bg-yellow-950"
                              : insight.type === "achievement"
                                ? "bg-purple-50 dark:bg-purple-950"
                                : "bg-blue-50 dark:bg-blue-950"
                        }`}
                      >
                        {insight.icon && (
                          <insight.icon
                            className={`h-5 w-5 mt-0.5 ${
                              insight.type === "success"
                                ? "text-green-600"
                                : insight.type === "warning"
                                  ? "text-yellow-600"
                                  : insight.type === "achievement"
                                    ? "text-purple-600"
                                    : "text-blue-600"
                            }`}
                          />
                        )}
                        <div>
                          <p className="font-medium">{insight.title}</p>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumen del Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round(
                        (totalWorkouts /
                          (timeFilter === "1month"
                            ? 4
                            : timeFilter === "3months"
                              ? 12
                              : timeFilter === "6months"
                                ? 24
                                : 52)) *
                          10,
                      ) / 10}
                    </div>
                    <p className="text-sm text-muted-foreground">Entrenamientos por semana</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0}
                    </div>
                    <p className="text-sm text-muted-foreground">kg promedio por sesión</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {filteredWorkouts.reduce((sum, w) => sum + (w.totalSets || 0), 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Series totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
