<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('quiz_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('quiz_sessions', 'video_appeal_url')) {
                $table->string('video_appeal_url')->nullable();
            }
            if (!Schema::hasColumn('quiz_sessions', 'appeal_status')) {
                $table->string('appeal_status')->nullable(); // pending, approved, rejected
            }
            if (!Schema::hasColumn('quiz_sessions', 'appeal_feedback')) {
                $table->text('appeal_feedback')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->dropColumn(['video_appeal_url', 'appeal_status', 'appeal_feedback']);
        });
    }
};
