"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { exercises } from "@/lib/exercises-data"
import { Play, Pause, Square, Plus, Minus, Timer, Search, Dumbbell, BookOpen, Link, Unlink, Trash2 } from "lucide-react"

interface Exercise {
  id?: string
  name: string
  category: string
  equipment: string
  instructions: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  isometric?: boolean
}

interface WorkoutExercise {
  id: string
  name: string
  sets: Array<{
    weight: number
    reps: number
    rpe?: number
    completed: boolean
    duration?: number
  }>
  notes?: string
  supersetId?: string
  isometric?: boolean
}

interface Template {
  id: string
  name: string
  description: string
  exercises: Array<{
    name: string
    sets: number
    reps: string
    weight?: string
    notes?: string
  }>
  createdAt: string
  lastUsed?: string
}

export default function WorkoutPage() {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [workoutDuration, setWorkoutDuration] = useState(0)
  const [currentExercises, setCurrentExercises] = useState<WorkoutExercise[]>([])
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false)
  const [isCreateExerciseDialogOpen, setIsCreateExerciseDialogOpen] = useState(false)
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false)
  const [isLoadTemplateDialogOpen, setIsLoadTemplateDialogOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [customExercises, setCustomExercises] = useState<Exercise[]>([])
  const [selectedExercisesForSuperset, setSelectedExercisesForSuperset] = useState<string[]>([])

  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "",
    equipment: "",
    instructions: "",
    primaryMuscles: "",
    secondaryMuscles: "",
    isometric: false, // Added isometric property
  })

  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
  })

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isWorkoutActive && workoutStartTime) {
      interval = setInterval(() => {
        setWorkoutDuration(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000))
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isWorkoutActive, workoutStartTime])

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isResting, restTimer])

  // Load templates and custom exercises
  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem("gym-templates")
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates))
      }

      const savedCustomExercises = localStorage.getItem("gym-custom-exercises")
      if (savedCustomExercises) {
        setCustomExercises(JSON.parse(savedCustomExercises))
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Safely combine exercises with null checks
  const allExercises = [...(exercises || []), ...(customExercises || [])]

  const startWorkout = () => {
    setIsWorkoutActive(true)
    setWorkoutStartTime(new Date())
    setWorkoutDuration(0)
  }

  const pauseWorkout = () => {
    setIsWorkoutActive(false)
  }

  const finishWorkout = () => {
    if (!currentExercises || currentExercises.length === 0) return

    const workoutData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: Math.floor(workoutDuration / 60),
      exercises: currentExercises.map((exercise) => ({
        name: exercise.name,
        sets: (exercise.sets || [])
          .filter((set) => set.completed)
          .map((set) => ({
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
          })),
        notes: exercise.notes,
        supersetId: exercise.supersetId,
      })),
    }

    try {
      // Save workout
      const savedWorkouts = localStorage.getItem("gym-workouts")
      const workouts = savedWorkouts ? JSON.parse(savedWorkouts) : []
      workouts.unshift(workoutData)
      localStorage.setItem("gym-workouts", JSON.stringify(workouts))

      // Reset workout state
      setIsWorkoutActive(false)
      setWorkoutStartTime(null)
      setWorkoutDuration(0)
      setCurrentExercises([])
      setRestTimer(0)
      setIsResting(false)

      alert("¡Entrenamiento guardado exitosamente!")
    } catch (error) {
      console.error("Error saving workout:", error)
      alert("Error al guardar el entrenamiento")
    }
  }

  const addExerciseToWorkout = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise = {
      id: Date.now().toString(),
      name: exercise.name,
      sets: exercise.isometric
        ? [{ weight: 0, reps: 0, duration: 30, completed: false }]
        : [{ weight: 0, reps: 0, completed: false }],
      isometric: exercise.isometric,
    }

    setCurrentExercises((prev) => [...(prev || []), newWorkoutExercise])
    setIsAddExerciseDialogOpen(false)
  }

  const createCustomExercise = () => {
    if (!newExercise.name.trim() || !newExercise.category.trim()) return

    const exercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: newExercise.name.trim(),
      category: newExercise.category,
      equipment: newExercise.equipment || "bodyweight",
      instructions: newExercise.instructions.trim(),
      primaryMuscles: newExercise.primaryMuscles
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      secondaryMuscles: newExercise.secondaryMuscles
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      isometric: newExercise.isometric, // Include isometric property
    }

    try {
      // Save custom exercise
      const updatedCustomExercises = [...(customExercises || []), exercise]
      setCustomExercises(updatedCustomExercises)
      localStorage.setItem("gym-custom-exercises", JSON.stringify(updatedCustomExercises))

      // Add to current workout
      const exerciseToAdd = {
        ...exercise,
        sets: [],
      }
      setCurrentExercises((prev) => [...(prev || []), exerciseToAdd])

      // Reset form
      setNewExercise({
        name: "",
        category: "",
        equipment: "",
        instructions: "",
        primaryMuscles: "",
        secondaryMuscles: "",
        isometric: false,
      })
      setIsCreateExerciseDialogOpen(false)
    } catch (error) {
      console.error("Error creating custom exercise:", error)
    }
  }

  const addSet = (exerciseId: string) => {
    setCurrentExercises((prev) =>
      (prev || []).map((exercise) => {
        if (exercise.id === exerciseId) {
          const newSet = exercise.isometric
            ? { weight: 0, reps: 0, duration: 30, completed: false }
            : { weight: 0, reps: 0, completed: false }

          return {
            ...exercise,
            sets: [...(exercise.sets || []), newSet],
          }
        }
        return exercise
      }),
    )
  }

  const removeSet = (exerciseId: string, setIndex: number) => {
    setCurrentExercises((prev) =>
      (prev || []).map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: (exercise.sets || []).filter((_, index) => index !== setIndex),
            }
          : exercise,
      ),
    )
  }

  const updateSet = (exerciseId: string, setIndex: number, field: string, value: any) => {
    setCurrentExercises((prev) =>
      (prev || []).map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: (exercise.sets || []).map((set, index) => (index === setIndex ? { ...set, [field]: value } : set)),
            }
          : exercise,
      ),
    )
  }

  const completeSet = (exerciseId: string, setIndex: number) => {
    updateSet(exerciseId, setIndex, "completed", true)

    // Check if this exercise is part of a superset
    const exercise = (currentExercises || []).find((ex) => ex.id === exerciseId)
    const isInSuperset = exercise?.supersetId

    if (isInSuperset) {
      // Find all exercises in the same superset
      const supersetExercises = (currentExercises || []).filter((ex) => ex.supersetId === exercise.supersetId)
      const currentExerciseIndex = supersetExercises.findIndex((ex) => ex.id === exerciseId)
      const isLastInSuperset = currentExerciseIndex === supersetExercises.length - 1

      if (isLastInSuperset) {
        // Start rest timer after completing the last exercise in superset (2 minutes)
        setRestTimer(120)
        setIsResting(true)
      }
      // No timer between exercises in superset
    } else {
      // Regular exercise - start normal rest timer (90 seconds)
      setRestTimer(90)
      setIsResting(true)
    }
  }

  const removeExercise = (exerciseId: string) => {
    setCurrentExercises((prev) => (prev || []).filter((exercise) => exercise.id !== exerciseId))
  }

  const createSuperset = () => {
    if (!selectedExercisesForSuperset || selectedExercisesForSuperset.length < 2) return

    const supersetId = Date.now().toString()

    setCurrentExercises((prev) =>
      (prev || []).map((exercise) =>
        selectedExercisesForSuperset.includes(exercise.id) ? { ...exercise, supersetId } : exercise,
      ),
    )

    setSelectedExercisesForSuperset([])
  }

  const removeFromSuperset = (exerciseId: string) => {
    const exercise = (currentExercises || []).find((ex) => ex.id === exerciseId)
    if (!exercise?.supersetId) return

    const supersetId = exercise.supersetId

    // Remove superset ID from this exercise
    setCurrentExercises((prev) =>
      (prev || []).map((ex) => (ex.id === exerciseId ? { ...ex, supersetId: undefined } : ex)),
    )

    // Check if superset has less than 2 exercises remaining
    const remainingInSuperset = (currentExercises || []).filter(
      (ex) => ex.supersetId === supersetId && ex.id !== exerciseId,
    )

    if (remainingInSuperset.length < 2) {
      // Remove superset ID from remaining exercises
      setCurrentExercises((prev) =>
        (prev || []).map((ex) => (ex.supersetId === supersetId ? { ...ex, supersetId: undefined } : ex)),
      )
    }
  }

  const saveAsTemplate = () => {
    if (!templateData.name.trim() || !currentExercises || currentExercises.length === 0) return

    const template: Template = {
      id: Date.now().toString(),
      name: templateData.name.trim(),
      description: templateData.description.trim(),
      exercises: currentExercises.map((exercise) => ({
        name: exercise.name,
        sets: (exercise.sets || []).length,
        reps:
          (exercise.sets || []).length > 0 ? `${exercise.sets[0].reps || 8}-${exercise.sets[0].reps || 12}` : "8-12",
        weight:
          (exercise.sets || []).length > 0 && exercise.sets[0].weight > 0 ? exercise.sets[0].weight.toString() : "",
        notes: exercise.notes || "",
      })),
      createdAt: new Date().toISOString(),
    }

    try {
      const updatedTemplates = [...(templates || []), template]
      setTemplates(updatedTemplates)
      localStorage.setItem("gym-templates", JSON.stringify(updatedTemplates))

      setTemplateData({ name: "", description: "" })
      setIsSaveTemplateDialogOpen(false)
      alert(`¡Plantilla "${template.name}" guardada exitosamente!`)
    } catch (error) {
      console.error("Error saving template:", error)
    }
  }

  const loadTemplate = (template: Template) => {
    const templateExercises: WorkoutExercise[] = (template.exercises || []).map((exercise) => ({
      id: Date.now().toString() + Math.random(),
      name: exercise.name,
      sets: Array(exercise.sets || 1)
        .fill(null)
        .map(() => ({
          weight: exercise.weight ? Number.parseInt(exercise.weight) : 0,
          reps: Number.parseInt((exercise.reps || "8").split("-")[0]) || 8,
          completed: false,
        })),
      notes: exercise.notes,
    }))

    setCurrentExercises(templateExercises)
    setIsLoadTemplateDialogOpen(false)

    try {
      // Update template last used
      const updatedTemplates = (templates || []).map((t) =>
        t.id === template.id ? { ...t, lastUsed: new Date().toISOString() } : t,
      )
      setTemplates(updatedTemplates)
      localStorage.setItem("gym-templates", JSON.stringify(updatedTemplates))
    } catch (error) {
      console.error("Error updating template:", error)
    }
  }

  const filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(allExercises.map((ex) => ex.category).filter(Boolean)))

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const hasCompletedSets = (currentExercises || []).some((exercise) =>
    (exercise.sets || []).some((set) => set.completed),
  )

  // Group exercises by superset with null checks
  const groupedExercises = (currentExercises || []).reduce(
    (groups, exercise) => {
      if (exercise.supersetId) {
        if (!groups[exercise.supersetId]) {
          groups[exercise.supersetId] = []
        }
        groups[exercise.supersetId].push(exercise)
      } else {
        groups[exercise.id] = [exercise]
      }
      return groups
    },
    {} as { [key: string]: WorkoutExercise[] },
  )

  const availableForSuperset = (currentExercises || []).filter((ex) => !ex.supersetId)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Entrenamiento</h1>
              <p className="text-muted-foreground">
                {isWorkoutActive ? `Duración: ${formatTime(workoutDuration)}` : "Comenzá tu entrenamiento"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isWorkoutActive ? (
                <>
                  <Dialog open={isLoadTemplateDialogOpen} onOpenChange={setIsLoadTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Cargar Plantilla
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Cargar Plantilla</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {!templates || templates.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">No hay plantillas guardadas</p>
                        ) : (
                          templates.map((template) => (
                            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                              <CardContent className="p-4" onClick={() => loadTemplate(template)}>
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-medium">{template.name}</h3>
                                  <Badge variant="secondary">{(template.exercises || []).length} ejercicios</Badge>
                                </div>
                                {template.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                                )}
                                <div className="flex flex-wrap gap-1">
                                  {(template.exercises || []).slice(0, 3).map((exercise, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {exercise.name}
                                    </Badge>
                                  ))}
                                  {(template.exercises || []).length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{(template.exercises || []).length - 3} más
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button onClick={startWorkout}>
                    <Play className="h-4 w-4 mr-2" />
                    Comenzar
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={pauseWorkout}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                  <Button onClick={finishWorkout} disabled={!hasCompletedSets}>
                    <Square className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Rest Timer */}
        {isResting && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Descanso</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-800">{formatTime(restTimer)}</div>
                  <Button variant="outline" size="sm" onClick={() => setIsResting(false)} className="mt-1">
                    Saltar
                  </Button>
                </div>
              </div>
              <Progress value={((120 - restTimer) / 120) * 100} className="mt-2" />
            </CardContent>
          </Card>
        )}

        {/* Current Exercises */}
        {Object.entries(groupedExercises).map(([groupId, exercises]) => {
          const isSuperset = exercises && exercises.length > 1

          return (
            <Card key={groupId} className={isSuperset ? "border-blue-200 bg-blue-50/30" : ""}>
              {isSuperset && (
                <div className="bg-blue-100 px-4 py-2 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Súper Set</span>
                    <Badge variant="secondary">{exercises.length} ejercicios</Badge>
                  </div>
                </div>
              )}

              <CardContent className="p-4 space-y-4">
                {(exercises || []).map((exercise, exerciseIndex) => (
                  <div key={exercise.id} className={isSuperset ? "border-l-4 border-blue-400 pl-4" : ""}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isSuperset && (
                          <Badge variant="outline" className="text-xs">
                            {exerciseIndex + 1}
                          </Badge>
                        )}
                        <h3 className="font-medium">{exercise.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {exercise.supersetId && (
                          <Button variant="outline" size="sm" onClick={() => removeFromSuperset(exercise.id)}>
                            <Unlink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => removeExercise(exercise.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Sets */}
                    <div className="space-y-2">
                      {(exercise.sets || []).map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center gap-2 p-2 border rounded">
                          <span className="text-sm font-medium w-12">Serie {setIndex + 1}</span>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Peso (kg)</Label>
                              <Input
                                type="number"
                                value={set.weight || ""}
                                onChange={(e) =>
                                  updateSet(exercise.id, setIndex, "weight", Number.parseFloat(e.target.value) || 0)
                                }
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{exercise.isometric ? "Tiempo (seg)" : "Reps"}</Label>
                              <Input
                                type="number"
                                value={exercise.isometric ? set.duration || "" : set.reps || ""}
                                onChange={(e) => {
                                  const value = Number.parseInt(e.target.value) || 0
                                  if (exercise.isometric) {
                                    updateSet(exercise.id, setIndex, "duration", value)
                                  } else {
                                    updateSet(exercise.id, setIndex, "reps", value)
                                  }
                                }}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">RPE</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={set.rpe || ""}
                                onChange={(e) =>
                                  updateSet(exercise.id, setIndex, "rpe", Number.parseInt(e.target.value) || undefined)
                                }
                                className="h-8"
                              />
                            </div>
                          </div>

                          {set.completed ? (
                            <Badge variant="default" className="bg-green-500">
                              ✓ Completada
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => completeSet(exercise.id, setIndex)}
                              disabled={!set.weight || !set.reps}
                            >
                              Completar
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSet(exercise.id, setIndex)}
                            disabled={(exercise.sets || []).length <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => addSet(exercise.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Serie
                      </Button>
                    </div>

                    {/* Exercise Notes */}
                    <div className="mt-3">
                      <Textarea
                        placeholder="Notas del ejercicio..."
                        value={exercise.notes || ""}
                        onChange={(e) =>
                          setCurrentExercises((prev) =>
                            (prev || []).map((ex) => (ex.id === exercise.id ? { ...ex, notes: e.target.value } : ex)),
                          )
                        }
                        className="h-20"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}

        {/* Create Superset Section */}
        {availableForSuperset.length >= 2 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link className="h-5 w-5" />
                Crear Súper Set
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Seleccioná 2 o más ejercicios para crear un súper set:</p>

                <div className="space-y-2">
                  {availableForSuperset.map((exercise) => (
                    <div key={exercise.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={exercise.id}
                        checked={(selectedExercisesForSuperset || []).includes(exercise.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedExercisesForSuperset((prev) => [...(prev || []), exercise.id])
                          } else {
                            setSelectedExercisesForSuperset((prev) => (prev || []).filter((id) => id !== exercise.id))
                          }
                        }}
                      />
                      <Label htmlFor={exercise.id} className="text-sm">
                        {exercise.name}
                      </Label>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={createSuperset}
                  disabled={!selectedExercisesForSuperset || selectedExercisesForSuperset.length < 2}
                  className="w-full"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Crear Súper Set ({(selectedExercisesForSuperset || []).length} ejercicios)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Exercise Button */}
        <div className="flex gap-2">
          <Dialog open={isAddExerciseDialogOpen} onOpenChange={setIsAddExerciseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ejercicio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Agregar Ejercicio</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 flex-1 overflow-hidden">
                {/* Search and Filter */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ejercicios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Create Exercise Button */}
                <Dialog open={isCreateExerciseDialogOpen} onOpenChange={setIsCreateExerciseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Ejercicio Personalizado
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Crear Ejercicio Personalizado</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exercise-name">Nombre del Ejercicio *</Label>
                          <Input
                            id="exercise-name"
                            value={newExercise.name}
                            onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                            placeholder="Ej: Press de banca inclinado"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="exercise-category">Categoría</Label>
                          <Select
                            value={newExercise.category}
                            onValueChange={(value) => setNewExercise({ ...newExercise, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Chest">Pecho</SelectItem>
                              <SelectItem value="Back">Espalda</SelectItem>
                              <SelectItem value="Legs">Piernas</SelectItem>
                              <SelectItem value="Shoulders">Hombros</SelectItem>
                              <SelectItem value="Arms">Brazos</SelectItem>
                              <SelectItem value="Core">Core</SelectItem>
                              <SelectItem value="Cardio">Cardio</SelectItem>
                              <SelectItem value="Flexibilidad">Flexibilidad</SelectItem>
                              <SelectItem value="Pliométricos">Pliométricos</SelectItem>
                              <SelectItem value="Personalizado">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exercise-equipment">Equipamiento</Label>
                          <Input
                            id="exercise-equipment"
                            value={newExercise.equipment}
                            onChange={(e) => setNewExercise({ ...newExercise, equipment: e.target.value })}
                            placeholder="Ej: Barra, Mancuernas, Peso Corporal"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tipo de Ejercicio</Label>
                          <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                              id="isometric"
                              checked={newExercise.isometric}
                              onCheckedChange={(checked) =>
                                setNewExercise({ ...newExercise, isometric: checked as boolean })
                              }
                            />
                            <Label htmlFor="isometric" className="text-sm">
                              ¿Ejercicio isométrico?
                            </Label>
                          </div>
                          {newExercise.isometric && (
                            <p className="text-xs text-muted-foreground">
                              Se medirá en tiempo (segundos) en lugar de repeticiones
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="exercise-instructions">Instrucciones</Label>
                        <Textarea
                          id="exercise-instructions"
                          value={newExercise.instructions}
                          onChange={(e) => setNewExercise((prev) => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Describe cómo realizar el ejercicio..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primary-muscles">Músculos Primarios</Label>
                          <Input
                            id="primary-muscles"
                            value={newExercise.primaryMuscles}
                            onChange={(e) => setNewExercise((prev) => ({ ...prev, primaryMuscles: e.target.value }))}
                            placeholder="Ej: Pecho, Tríceps (separar por comas)"
                          />
                        </div>

                        <div>
                          <Label htmlFor="secondary-muscles">Músculos Secundarios</Label>
                          <Input
                            id="secondary-muscles"
                            value={newExercise.secondaryMuscles}
                            onChange={(e) => setNewExercise((prev) => ({ ...prev, secondaryMuscles: e.target.value }))}
                            placeholder="Ej: Hombros (separar por comas)"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateExerciseDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={createCustomExercise}
                          disabled={!newExercise.name.trim() || !newExercise.category.trim()}
                        >
                          Crear Ejercicio
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Exercise List */}
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {filteredExercises.map((exercise, index) => (
                    <Card key={exercise.id || index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3" onClick={() => addExerciseToWorkout(exercise)}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{exercise.name}</h3>
                              {(customExercises || []).some((ce) => ce.id === exercise.id) && (
                                <Badge variant="secondary" className="text-xs">
                                  Personalizado
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">{exercise.category}</Badge>
                              <Badge variant="outline">{exercise.equipment}</Badge>
                            </div>
                            {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">{exercise.primaryMuscles.join(", ")}</p>
                            )}
                          </div>
                          <Dumbbell className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Save as Template Button */}
          {hasCompletedSets && (
            <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guardar como Plantilla
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Guardar como Plantilla</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Nombre de la Plantilla *</Label>
                    <Input
                      id="template-name"
                      value={templateData.name}
                      onChange={(e) => setTemplateData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Mi Rutina de Pecho"
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-description">Descripción</Label>
                    <Textarea
                      id="template-description"
                      value={templateData.description}
                      onChange={(e) => setTemplateData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe esta rutina..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Vista previa de la plantilla:</p>
                    <div className="space-y-1">
                      {(currentExercises || []).map((exercise, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{exercise.name}</span>
                          <span className="text-muted-foreground">
                            {(exercise.sets || []).filter((set) => set.completed).length} series completadas
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsSaveTemplateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveAsTemplate} disabled={!templateData.name.trim()}>
                    Guardar Plantilla
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Empty State */}
        {(!currentExercises || currentExercises.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Comenzá tu Entrenamiento</h3>
              <p className="text-muted-foreground mb-4">Agregá ejercicios para empezar a registrar tu entrenamiento</p>
              <Button onClick={() => setIsAddExerciseDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Ejercicio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
