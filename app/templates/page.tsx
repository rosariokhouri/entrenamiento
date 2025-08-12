"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, Edit, Trash2, Play, Copy } from "lucide-react"
import { useRouter } from "next/navigation"

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

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    exercises: [{ name: "", sets: 3, reps: "8-12", weight: "", notes: "" }],
  })

  useEffect(() => {
    const savedTemplates = localStorage.getItem("gym-templates")
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates))
    } else {
      const defaultTemplates: Template[] = [
        {
          id: "1",
          name: "Día de Empuje",
          description: "Entrenamiento de pecho, hombros y tríceps",
          exercises: [
            { name: "Press de Banca", sets: 4, reps: "6-8" },
            { name: "Press Inclinado", sets: 3, reps: "8-10" },
            { name: "Press Militar", sets: 3, reps: "8-10" },
            { name: "Elevaciones Laterales", sets: 3, reps: "12-15" },
            { name: "Fondos de Tríceps", sets: 3, reps: "10-12" },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Día de Tirón",
          description: "Entrenamiento enfocado en espalda y bíceps",
          exercises: [
            { name: "Peso Muerto", sets: 4, reps: "5-6" },
            { name: "Dominadas", sets: 3, reps: "8-12" },
            { name: "Remo con Barra", sets: 3, reps: "8-10" },
            { name: "Jalón al Pecho", sets: 3, reps: "10-12" },
            { name: "Curl de Bíceps", sets: 3, reps: "12-15" },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Día de Piernas",
          description: "Entrenamiento completo de tren inferior",
          exercises: [
            { name: "Sentadilla", sets: 4, reps: "6-8" },
            { name: "Peso Muerto Rumano", sets: 3, reps: "8-10" },
            { name: "Prensa de Piernas", sets: 3, reps: "12-15" },
            { name: "Estocadas", sets: 3, reps: "10-12" },
            { name: "Curl de Piernas", sets: 3, reps: "12-15" },
          ],
          createdAt: new Date().toISOString(),
        },
      ]
      setTemplates(defaultTemplates)
      localStorage.setItem("gym-templates", JSON.stringify(defaultTemplates))
    }
  }, [])

  const saveTemplates = (updatedTemplates: Template[]) => {
    setTemplates(updatedTemplates)
    localStorage.setItem("gym-templates", JSON.stringify(updatedTemplates))
  }

  const createTemplate = () => {
    if (editingTemplate) {
      updateTemplate()
      return
    }

    const template: Template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      exercises: newTemplate.exercises.filter((ex) => ex.name.trim() !== ""),
      createdAt: new Date().toISOString(),
    }

    saveTemplates([...templates, template])
    setNewTemplate({
      name: "",
      description: "",
      exercises: [{ name: "", sets: 3, reps: "8-12", weight: "", notes: "" }],
    })
    setIsCreateDialogOpen(false)
  }

  const deleteTemplate = (templateId: string) => {
    saveTemplates(templates.filter((t) => t.id !== templateId))
  }

  const duplicateTemplate = (template: Template) => {
    const duplicated: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copia)`,
      createdAt: new Date().toISOString(),
      lastUsed: undefined,
    }
    saveTemplates([...templates, duplicated])
  }

  const startWorkoutFromTemplate = (template: Template) => {
    localStorage.setItem("workout-template", JSON.stringify(template))
    const updatedTemplates = templates.map((t) =>
      t.id === template.id ? { ...t, lastUsed: new Date().toISOString() } : t,
    )
    saveTemplates(updatedTemplates)
    router.push("/workout?template=" + template.id)
  }

  const editTemplate = (template: Template) => {
    setEditingTemplate(template)
    setNewTemplate({
      name: template.name,
      description: template.description,
      exercises: [...template.exercises],
    })
    setIsCreateDialogOpen(true)
  }

  const updateTemplate = () => {
    if (!editingTemplate) return

    const updatedTemplate: Template = {
      ...editingTemplate,
      name: newTemplate.name,
      description: newTemplate.description,
      exercises: newTemplate.exercises.filter((ex) => ex.name.trim() !== ""),
    }

    const updatedTemplates = templates.map((t) => (t.id === editingTemplate.id ? updatedTemplate : t))

    saveTemplates(updatedTemplates)
    setEditingTemplate(null)
    setNewTemplate({
      name: "",
      description: "",
      exercises: [{ name: "", sets: 3, reps: "8-12", weight: "", notes: "" }],
    })
    setIsCreateDialogOpen(false)
  }

  const addExerciseToTemplate = () => {
    setNewTemplate((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: "", sets: 3, reps: "8-12", weight: "", notes: "" }],
    }))
  }

  const updateExercise = (index: number, field: string, value: any) => {
    setNewTemplate((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, idx) => (idx === index ? { ...ex, [field]: value } : ex)),
    }))
  }

  const removeExercise = (index: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index),
    }))
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Plantillas de Entrenamiento</h1>
              <p className="text-muted-foreground">Guardá y reutilizá tus rutinas favoritas</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Plantilla
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTemplate ? "Editar Plantilla" : "Crear Nueva Plantilla"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Nombre de la Plantilla</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="ej., Día de Empuje, Tren Superior"
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-description">Descripción</Label>
                    <Textarea
                      id="template-description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Breve descripción de este entrenamiento"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Ejercicios</Label>
                      <Button variant="outline" size="sm" onClick={addExerciseToTemplate}>
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Ejercicio
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {newTemplate.exercises.map((exercise, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Input
                              placeholder="Nombre del ejercicio"
                              value={exercise.name}
                              onChange={(e) => updateExercise(index, "name", e.target.value)}
                              className="flex-1 mr-2"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExercise(index)}
                              disabled={newTemplate.exercises.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Series</Label>
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(index, "sets", Number.parseInt(e.target.value) || 0)}
                                min="1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Reps</Label>
                              <Input
                                placeholder="8-12"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(index, "reps", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Peso (opcional)</Label>
                              <Input
                                placeholder="kg"
                                value={exercise.weight}
                                onChange={(e) => updateExercise(index, "weight", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false)
                        setEditingTemplate(null)
                        setNewTemplate({
                          name: "",
                          description: "",
                          exercises: [{ name: "", sets: 3, reps: "8-12", weight: "", notes: "" }],
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={createTemplate}
                      disabled={!newTemplate.name.trim() || newTemplate.exercises.every((ex) => !ex.name.trim())}
                    >
                      {editingTemplate ? "Actualizar Plantilla" : "Crear Plantilla"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aún no hay plantillas</h3>
              <p className="text-muted-foreground mb-4">Creá tu primera plantilla de entrenamiento para empezar</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Plantilla
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{template.exercises.length} ejercicios</Badge>
                        {template.lastUsed && (
                          <Badge variant="outline">
                            Último uso: {new Date(template.lastUsed).toLocaleDateString("es-AR")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Ejercicios:</p>
                    <div className="space-y-1">
                      {template.exercises.slice(0, 3).map((exercise, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{exercise.name}</span>
                          <span className="text-muted-foreground">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </div>
                      ))}
                      {template.exercises.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{template.exercises.length - 3} ejercicios más</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" onClick={() => startWorkoutFromTemplate(template)}>
                      <Play className="h-4 w-4 mr-1" />
                      Iniciar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                      title="Vista previa"
                    >
                      👁️
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => editTemplate(template)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateTemplate(template)} title="Duplicar">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteTemplate(template.id)} title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground">{previewTemplate.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{previewTemplate.exercises.length} ejercicios</Badge>
                  <Badge variant="outline">
                    Creado: {new Date(previewTemplate.createdAt).toLocaleDateString("es-AR")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Ejercicios:</h4>
                {previewTemplate.exercises.map((exercise, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{exercise.name}</h5>
                      <Badge variant="outline">
                        {exercise.sets} × {exercise.reps}
                      </Badge>
                    </div>
                    {exercise.weight && <p className="text-sm text-muted-foreground">Peso: {exercise.weight} kg</p>}
                    {exercise.notes && <p className="text-sm text-muted-foreground">Notas: {exercise.notes}</p>}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setPreviewTemplate(null)
                    startWorkoutFromTemplate(previewTemplate)
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Entrenamiento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
