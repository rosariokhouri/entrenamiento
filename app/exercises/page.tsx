"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Dumbbell, Info } from 'lucide-react'
import { exercises } from "@/lib/exercises-data"

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedEquipment, setSelectedEquipment] = useState("all")

  const categories = ["all", ...Array.from(new Set(exercises.map(ex => ex.category)))]
  const equipment = ["all", ...Array.from(new Set(exercises.map(ex => ex.equipment)))]

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory
    const matchesEquipment = selectedEquipment === "all" || exercise.equipment === selectedEquipment
    
    return matchesSearch && matchesCategory && matchesEquipment
  })

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Base de Ejercicios</h1>
          <p className="text-muted-foreground">Explorá y aprendé sobre diferentes ejercicios</p>
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
                  {categories.map(category => (
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
                  {equipment.map(eq => (
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
            Mostrando {filteredExercises.length} de {exercises.length} ejercicios
          </p>
        </div>

        {/* Grilla de Ejercicios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{exercise.category}</Badge>
                      <Badge variant="outline">{exercise.equipment}</Badge>
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
                        <DialogTitle>{exercise.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Badge>{exercise.category}</Badge>
                          <Badge variant="outline">{exercise.equipment}</Badge>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Instrucciones</h4>
                          <p className="text-sm text-muted-foreground">{exercise.instructions}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Músculos Primarios</h4>
                            <div className="flex flex-wrap gap-1">
                              {exercise.primaryMuscles.map((muscle, idx) => (
                                <Badge key={idx} variant="default" className="text-xs">
                                  {muscle}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {exercise.secondaryMuscles.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Músculos Secundarios</h4>
                              <div className="flex flex-wrap gap-1">
                                {exercise.secondaryMuscles.map((muscle, idx) => (
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
                  <div>
                    <p className="text-sm font-medium mb-1">Músculos Primarios</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.primaryMuscles.slice(0, 2).map((muscle, idx) => (
                        <Badge key={idx} variant="default" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                      {exercise.primaryMuscles.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{exercise.primaryMuscles.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exercise.instructions}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
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
