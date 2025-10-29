<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model

{
    use HasFactory;
    protected $fillable = [
        'name',
        'content',
        'field',
        'signature_field',
        'page_size',
        'font_size',
        'title',
        'title_font_size',
        'user_id',
    ];

    protected $casts = [
        'field' => 'array',
        'signature_field' => 'array',
    ];

    //Relacion con el usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    //Relacion con documentos
    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}