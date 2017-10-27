<div class="grid-lg-4 grid-md-12">
    @if(!empty($section['section_image']['url']))
        <img src="{{ $section['section_image']['url'] }}" class="image virtual-section-image hidden-xs hidden-sm hidden-md" alt="{{ $section['section_title'] }}">
    @endif
    @if(!empty($section['section_image_part']['url']))
        <img src="{{ $section['section_image_part']['url'] }}" class="image virtual-section-image hidden-lg" alt="{{ $section['section_title'] }}">
    @endif
</div>
