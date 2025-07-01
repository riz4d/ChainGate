from datetime import timezone
from django.contrib.sessions.models import Session

def verify_session(request):

    session_id = request.COOKIES.get('sessionid')
    if not session_id:
        return False

    try:
        session = Session.objects.get(session_key=session_id)
        decoded_admin_id = session.get_decoded().get('admin_id')
        if not decoded_admin_id:
            return False
        admin_id = request.session['admin_id']
        if admin_id != decoded_admin_id:
            return False
        # if not session.expire_date or session.expire_date < timezone.now():
        #     return False
        return True
    except Session.DoesNotExist:
        return False