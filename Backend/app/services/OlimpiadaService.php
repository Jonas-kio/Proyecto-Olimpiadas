<?php

namespace App\Services;

use App\Models\Olimpiada;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OlimpiadaService
{

    public function getPaginatedOlimpiadas(int $perPage = 10): LengthAwarePaginator
    {
        return Olimpiada::with('areas')->orderBy('created_at', 'desc')->paginate($perPage);
    }


    public function createOlimpiada(
        array $data,
        ?UploadedFile $pdfDetalles = null,
        ?UploadedFile $imagenPortada = null,
        ?array $areas = []
    ): Olimpiada {
        return DB::transaction(function () use ($data, $pdfDetalles, $imagenPortada, $areas) {
            $olimpiada = Olimpiada::create($data);

            if ($pdfDetalles) {
                $rutaPdf = $pdfDetalles->store('olimpiadas/pdfs', 'public');
                $olimpiada->ruta_pdf_detalles = $rutaPdf;
            }

            if ($imagenPortada) {
                $rutaImagen = $imagenPortada->store('olimpiadas/portadas', 'public');
                $olimpiada->ruta_imagen_portada = $rutaImagen;
            }

            $olimpiada->save();

            if (!empty($areas)) {
                $olimpiada->areas()->attach($areas);
            }

            return $olimpiada;
        });
    }

    public function updateOlimpiada(Olimpiada $olimpiada, array $data, ?UploadedFile $pdfDetalles = null, ?UploadedFile $imagenPortada = null, ?array $areas = null): Olimpiada
    {
        return DB::transaction(function () use ($olimpiada, $data, $pdfDetalles, $imagenPortada, $areas) {

            $olimpiada->update($data);


            if ($pdfDetalles) {

                if ($olimpiada->ruta_pdf_detalles) {
                    Storage::disk('public')->delete($olimpiada->ruta_pdf_detalles);
                }

                $rutaPdf = Storage::disk('public')->putFile('olimpiadas/pdfs', $pdfDetalles);
                $olimpiada->ruta_pdf_detalles = $rutaPdf;
            }


            if ($imagenPortada) {

                if ($olimpiada->ruta_imagen_portada) {
                    Storage::disk('public')->delete($olimpiada->ruta_imagen_portada);
                }

                $rutaImagen = Storage::disk('public')->putFile('olimpiadas/portadas', $imagenPortada);
                $olimpiada->ruta_imagen_portada = $rutaImagen;
            }

            $olimpiada->save();

            if ($areas !== null) {
                if (!empty($areas)) {
                    $olimpiada->areas()->sync($areas);
                } else {
                    $olimpiada->areas()->detach();
                }
            }

            return $olimpiada;
        });
    }

    public function deleteOlimpiada(Olimpiada $olimpiada): bool
    {
        if ($olimpiada->ruta_pdf_detalles) {
            Storage::disk('public')->delete($olimpiada->ruta_pdf_detalles);
        }

        if ($olimpiada->ruta_imagen_portada) {
            Storage::disk('public')->delete($olimpiada->ruta_imagen_portada);
        }

        return $olimpiada->delete();
    }


    public function getOlimpiadaAreas(Olimpiada $olimpiada)
    {
        return $olimpiada->areas;
    }
}
