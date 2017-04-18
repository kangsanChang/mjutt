from django import forms
from .models import Classitem

class SearchForm(forms.ModelForm):

    class Meta:
        model = Classitem
        fields = ('dept', 'grade',)
