<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->uuid('assessment_id')->nullable()->after('id');
            $table->json('answers')->nullable()->after('quiz_json');
            $table->json('ai_scores')->nullable()->after('answers');
            $table->integer('tab_switches')->default(0)->after('score');
            $table->integer('copy_paste_events')->default(0)->after('tab_switches');
            $table->integer('window_blur_events')->default(0)->after('copy_paste_events');
            $table->boolean('suspicious_flag')->default(false)->after('window_blur_events');

            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->dropForeign(['assessment_id']);
            $table->dropColumn([
                'assessment_id',
                'answers',
                'ai_scores',
                'tab_switches',
                'copy_paste_events',
                'window_blur_events',
                'suspicious_flag'
            ]);
        });
    }
};
