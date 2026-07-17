<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('youtube_url', 500)->nullable();
            $table->string('youtube_video_id', 50)->nullable();
            $table->string('title', 500)->nullable();
            $table->longText('transcript_raw')->nullable();
            $table->longText('transcript_cleaned')->nullable();
            $table->json('concepts_extracted')->nullable();
            $table->enum('status', ['pending', 'processing', 'ready', 'failed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
