"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Dumbbell, Info, Plus } from "lucide-react"
import { exercises } from "@/lib/exercises-data"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedEquipment, setSelectedEquipment] = useState("all")
  const [customExercises, setCustomExercises] = useState([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "",
    equipment: "",
    instructions: "",
    primaryMuscles: "",
    secondaryMuscles: "",
  })

  useEffect(() => {
    try {
      const savedCustomExercises = localStorage.getItem("custom-exercises")
      if (savedCustomExercises) {
        const parsed = JSON.parse(savedCustomExercises)
        setCustomExercises(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error("Error loading custom exercises:", error)
      setCustomExercises([])
    }
  }, [])

  // Asegurar que exercises y customExercises sean arrays válidos
  const safeExercises = Array.isArray(exercises) ? exercises : []
  const safeCustomExercises = Array.isArray(customExercises) ? customExercises : []
  const allExercises = [...safeExercises, ...safeCustomExercises]

  const filteredExercises = allExercises.filter((exercise) => {
    if (!exercise) return false

    const exerciseName = exercise.name || ""
    const exercisePrimaryMuscles = Array.isArray(exercise.primaryMuscles) ? exercise.primaryMuscles : []
    const exerciseCategory = exercise.category || ""
    const exerciseEquipment = exercise.equipment || ""

    const matchesSearch =
      exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercisePrimaryMuscles.some((muscle) => (muscle || "").toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || exerciseCategory === selectedCategory
    const matchesEquipment = selectedEquipment === "all" || exerciseEquipment === selectedEquipment

    return matchesSearch && matchesCategory && matchesEquipment
  })

  const categories = [
    "all",
    ...Array.from(new Set(allExercises.filter((ex) => ex && ex.category).map((ex) => ex.category))),
  ]

  const equipment = [
    "all",
    ...Array.from(new Set(allExercises.filter((ex) => ex && ex.equipment).map((ex) => ex.equipment))),
  ]

  const handleCreateExercise = () => {
    if (!newExercise.name.trim()) return

    const exercise = {
      id: Date.now().toString(),
      name: newExercise.name.trim(),
      category: newExercise.category || "Personalizado",
      equipment: newExercise.equipment || "Otro",
      instructions: newExercise.instructions.trim(),
      primaryMuscles: newExercise.primaryMuscles
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m),
      secondaryMuscles: newExercise.secondaryMuscles
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m),
      isCustom: true,
    }

    const updatedCustomExercises = [...safeCustomExercises, exercise]
    setCustomExercises(updatedCustomExercises)

    try {
      localStorage.setItem("custom-exercises", JSON.stringify(updatedCustomExercises))
    } catch (error) {
      console.error("Error saving custom exercise:", error)
    }

    setNewExercise({
      name: "",
      category: "",
      equipment: "",
      instructions: "",
      primaryMuscles: "",
      secondaryMuscles: "",
    })
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Base de Ejercicios</h1>
              <p className="text-muted-foreground">Explorá y aprendé sobre diferentes ejercicios</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Ejercicio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Ejercicio Personalizado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre del Ejercicio *</Label>
                      <Input
                        id="name"
                        value={newExercise.name}
                        onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                        placeholder="Ej: Press de banca inclinado"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
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
                          <SelectItem value="Personalizado">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="equipment">Equipamiento</Label>
                    <Input
                      id="equipment"
                      value={newExercise.equipment}
                      onChange={(e) => setNewExercise({ ...newExercise, equipment: e.target.value })}
                      placeholder="Ej: Barra, Mancuernas, Peso Corporal"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions">Instrucciones</Label>
                    <Textarea
                      id="instructions"
                      value={newExercise.instructions}
                      onChange={(e) => setNewExercise({ ...newExercise, instructions: e.target.value })}
                      placeholder="Describe cómo realizar el ejercicio paso a paso..."
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary">Músculos Primarios</Label>
                      <Input
                        id="primary"
                        value={newExercise.primaryMuscles}
                        onChange={(e) => setNewExercise({ ...newExercise, primaryMuscles: e.target.value })}
                        placeholder="Ej: Pectorales, Tríceps (separados por comas)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondary">Músculos Secundarios</Label>
                      <Input
                        id="secondary"
                        value={newExercise.secondaryMuscles}
                        onChange={(e) => setNewExercise({ ...newExercise, secondaryMuscles: e.target.value })}
                        placeholder="Ej: Deltoides Anteriores (separados por comas)"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateExercise} disabled={!newExercise.name.trim()}>
                      Crear Ejercicio
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ejercicios o grupos musculares..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Todas las Categorías" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Equipamiento" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq === "all" ? "Todo el Equipamiento" : eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contador de Resultados */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredExercises.length} de {allExercises.length} ejercicios
            {safeCustomExercises.length > 0 && (
              <span className="ml-2 text-xs">({safeCustomExercises.length} personalizados)</span>
            )}
          </p>
        </div>

        {/* Grilla de Ejercicios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise, index) => {
            if (!exercise) return null

            const exercisePrimaryMuscles = Array.isArray(exercise.primaryMuscles) ? exercise.primaryMuscles : []
            const exerciseSecondaryMuscles = Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles : []
            const exerciseInstructions = Array.isArray(exercise.instructions)
              ? exercise.instructions.join(". ")
              : exercise.instructions || ""

            return (
              <Card key={exercise.id || index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{exercise.name || "Sin nombre"}</CardTitle>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary">{exercise.category || "Sin categoría"}</Badge>
                        <Badge variant="outline">{exercise.equipment || "Sin equipamiento"}</Badge>
                        {exercise.isCustom && (
                          <Badge variant="default" className="bg-green-500">
                            Personalizado
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{exercise.name || "Sin nombre"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2 flex-wrap">
                            <Badge>{exercise.category || "Sin categoría"}</Badge>
                            <Badge variant="outline">{exercise.equipment || "Sin equipamiento"}</Badge>
                            {exercise.isCustom && (
                              <Badge variant="default" className="bg-green-500">
                                Personalizado
                              </Badge>
                            )}
                          </div>

                          {exerciseInstructions && (
                            <div>
                              <h4 className="font-medium mb-2">Instrucciones</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {exerciseInstructions}
                              </p>
                            </div>
                          )}

                          <div className="grid md:grid-cols-2 gap-4">
                            {exercisePrimaryMuscles.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Músculos Primarios</h4>
                                <div className="flex flex-wrap gap-1">
                                  {exercisePrimaryMuscles.map((muscle, idx) => (
                                    <Badge key={idx} variant="default" className="text-xs">
                                      {muscle}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {exerciseSecondaryMuscles.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Músculos Secundarios</h4>
                                <div className="flex flex-wrap gap-1">
                                  {exerciseSecondaryMuscles.map((muscle, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {muscle}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exercisePrimaryMuscles.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Músculos Primarios</p>
                        <div className="flex flex-wrap gap-1">
                          {exercisePrimaryMuscles.slice(0, 2).map((muscle, idx) => (
                            <Badge key={idx} variant="default" className="text-xs">
                              {muscle}
                            </Badge>
                          ))}
                          {exercisePrimaryMuscles.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{exercisePrimaryMuscles.length - 2} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {exerciseInstructions && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{exerciseInstructions}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredExercises.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron ejercicios</h3>
              <p className="text-muted-foreground">Probá ajustando tu búsqueda o filtros</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
