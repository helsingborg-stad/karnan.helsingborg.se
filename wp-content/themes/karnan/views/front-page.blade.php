@extends('templates.master')

@section('content')

@include ('partials/elevator')

<div class="container main-container">
    <div class="grid-xs-12">
        @foreach ($sections as $section)
            <div class="panel">
                <article>
                    <h1>{{ $section['post_title'] }}</h1>
                    {!! $section['post_content'] !!}
                </article>
            </div>
        @endforeach
    </div>
</div>

@stop
