"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { Download, Upload, Trash2, Moon, Sun, SettingsIcon } from 'lucide-react'

interface AppSettings {
  defaultRestTime: number
  weightUnit: "kg" | "lbs"
  autoStartTimer: boolean
  showRPE: boolean
  showLastPerformance: boolean
  notifications: boolean
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<AppSettings>({
    defaultRestTime: 90,
    weightUnit: "kg",
    autoStartTimer: true,
    showRPE: true,
    showLastPerformance: true,
    notifications: true
  })

  useEffect(() => {
    const savedSettings = localStorage.getItem('gym-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('gym-settings', JSON.stringify(newSettings))
  }

  const exportData = () => {
    const workouts = localStorage.getItem('gym-workouts') || '[]'
    const templates = localStorage.getItem('gym-templates') || '[]'
    const appSettings = localStorage.getItem('gym-settings') || '{}'

    const exportData = {
      workouts: JSON.parse(workouts),
      templates: JSON.parse(templates),
      settings: JSON.parse(appSettings),
      exportDate: new Date().toISOString(),
      version: "1.0"
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gym-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (data.workouts) {
          localStorage.setItem('gym-workouts', JSON.stringify(data.workouts))
        }
        if (data.templates) {
          localStorage.setItem('gym-templates', JSON.stringify(data.templates))
        }
        if (data.settings) {
          localStorage.setItem('gym-settings', JSON.stringify(data.settings))
          setSettings(data.settings)
        }
        
        alert('¡Datos importados exitosamente! Por favor refrescá la página.')
      } catch (error) {
        alert('Error al importar datos. Por favor verificá el formato del archivo.')
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    if (confirm('¿Estás seguro de que querés borrar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('gym-workouts')
      localStorage.removeItem('gym-templates')
      localStorage.removeItem('gym-settings')
      alert('¡Todos los datos fueron borrados exitosamente! Por favor refrescá la página.')
    }
  }

  const getDataStats = () => {
    const workouts = JSON.parse(localStorage.getItem('gym-workouts') || '[]')
    const templates = JSON.parse(localStorage.getItem('gym-templates') || '[]')
    
    return {
      workouts: workouts.length,
      templates: templates.length,
      storageSize: Math.round((JSON.stringify(workouts).length + JSON.stringify(templates).length) / 1024)
    }
  }

  const stats = getDataStats()

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Personalizá tu experiencia de seguimiento de entrenamientos</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Apariencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">Elegí tu tema preferido</p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Entrenamientos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Configuración de Entrenamientos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Tiempo de Descanso por Defecto</Label>
                <p className="text-sm text-muted-foreground">Duración predeterminada del timer entre series</p>
              </div>
              <Select 
                value={settings.defaultRestTime.toString()} 
                onValueChange={(value) => updateSetting('defaultRestTime', parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1:00</SelectItem>
                  <SelectItem value="90">1:30</SelectItem>
                  <SelectItem value="120">2:00</SelectItem>
                  <SelectItem value="180">3:00</SelectItem>
                  <SelectItem value="240">4:00</SelectItem>
                  <SelectItem value="300">5:00</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Unidad de Peso</Label>
                <p className="text-sm text-muted-foreground">Elegí tu unidad de peso preferida</p>
              </div>
              <Select 
                value={settings.weightUnit} 
                onValueChange={(value: "kg" | "lbs") => updateSetting('weightUnit', value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-iniciar Timer de Descanso</Label>
                <p className="text-sm text-muted-foreground">Iniciar automáticamente el timer al completar una serie</p>
              </div>
              <Switch
                checked={settings.autoStartTimer}
                onCheckedChange={(checked) => updateSetting('autoStartTimer', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar Campo RPE</Label>
                <p className="text-sm text-muted-foreground">Mostrar entrada de Tasa de Esfuerzo Percibido</p>
              </div>
              <Switch
                checked={settings.showRPE}
                onCheckedChange={(checked) => updateSetting('showRPE', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar Último Rendimiento</Label>
                <p className="text-sm text-muted-foreground">Mostrar datos del entrenamiento anterior como referencia</p>
              </div>
              <Switch
                checked={settings.showLastPerformance}
                onCheckedChange={(checked) => updateSetting('showLastPerformance', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Datos */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estadísticas de Datos */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.workouts}</p>
                <p className="text-sm text-muted-foreground">Entrenamientos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.templates}</p>
                <p className="text-sm text-muted-foreground">Plantillas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.storageSize}</p>
                <p className="text-sm text-muted-foreground">KB Usados</p>
              </div>
            </div>

            {/* Exportar/Importar */}
            <div className="space-y-4">
              <div>
                <Label>Respaldo y Restauración</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Exportá tus datos para respaldo o importá desde un respaldo anterior
                </p>
                <div className="flex gap-2">
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Datos
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                      id="import-file"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="import-file" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Datos
                      </label>
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-destructive">Zona de Peligro</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Borrar permanentemente todos tus datos de entrenamientos y plantillas
                </p>
                <Button onClick={clearAllData} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Borrar Todos los Datos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acerca de */}
        <Card>
          <CardHeader>
            <CardTitle>Acerca de</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Gym Tracker</strong> - Tu compañero personal de fitness
              </p>
              <p className="text-sm text-muted-foreground">
                Versión 1.0.0 - Construido con Next.js y almacenamiento local
              </p>
              <p className="text-sm text-muted-foreground">
                Todos los datos se almacenan localmente en tu dispositivo para privacidad y acceso sin conexión
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
